import { checkLag, stopBot } from './helpers';
import { sendTelegramMessage } from './telegram';

// ==========================================
// ИНТЕРФЕЙСЫ
// ==========================================
export interface MaterialDef {
  graphic: Graphic;
  color: string;
}

export type MenuPathNode = string | { graphic: Graphic };

export interface CraftRecipe {
  /** Название предмета */
  name: string;
  /** Полный путь пунктов меню, например ["executioner's axe", 'mace', 'War Mace'] */
  path: MenuPathNode[];
  /** Graphic и color предмета */
  product: MaterialDef;
  /** Какие материалы и сколько их нужно на крафт 1 предмета  */
  materials: { def: MaterialDef; req: number }[];
}

export interface CraftConfig {
  /** Откуда берем материалы */
  resourcesContainerSerial: Serial;
  /** Куда кладем результат крафта */
  productsContainerSerial: Serial; //
  /** На сколько предметов брать реусрсов за раз */
  batchSize: number;
  /** Рецепты в порядке приоритета */
  recipes: CraftRecipe[];
  /** Функция старта: описывает, как именно вызвать меню крафта */
  startCraftAction: (recipe: CraftRecipe) => void;

  /** Режим работы (по умолчанию span) */
  mode?: 'spam' | 'set';
  /** Текст о начале крафта предмета */
  startMessage?: string;
  /** Текст об окончании крафта предмета */
  endMessage?: string;
}

// ==========================================
// ДВИЖОК
// ==========================================
export class UniversalCrafter {
  private config: CraftConfig;
  private endMessages: string;
  private allMaterials: MaterialDef[] = [];

  constructor(config: CraftConfig) {
    this.config = config;
    this.endMessages =
      config.endMessage ||
      'You put the|You failed|You have no|You have gainer|Ваша попытка провалилась';

    const uniqueMaterials: Record<string, MaterialDef> = {};

    for (const recipe of config.recipes) {
      for (const material of recipe.materials) {
        const key = `${material.def.graphic}_${material.def.color}`;
        uniqueMaterials[key] = material.def;
      }
    }

    for (const key in uniqueMaterials) {
      this.allMaterials.push(uniqueMaterials[key]);
    }
  }

  public run(): void {
    Orion.Print('Запуск универсального крафтера...');
    Orion.CancelWaitMenu();

    if (this.config.mode === 'set') {
      this.runSetMode();
    } else {
      this.runSpamMode(); // Старый режим (например, для прокачки)
    }
  }

  private runSpamMode(): void {
    while (true) {
      const recipeToCraft = this.findAvailableRecipe();
      if (!recipeToCraft) {
        Orion.Print('Нет ресурсов. Остановка.');
        stopBot();
        return;
      }
      this.prepareMaterials(recipeToCraft, this.config.batchSize);
      for (let i = 0; i < this.config.batchSize; i++) {
        this.craftItem(recipeToCraft);
        this.moveCraftedItems(recipeToCraft.product);
      }
    }
  }

  private runSetMode(): void {
    for (let setIndex = 0; setIndex < this.config.batchSize; setIndex++) {
      Orion.Print(
        `Создаем комплект ${setIndex + 1} из ${this.config.batchSize}...`,
      );

      for (const recipe of this.config.recipes) {
        let isSuccess = false;

        while (!isSuccess) {
          // Проверяем ресурсы ровно на 1 попытку
          if (!this.hasResourcesFor(recipe, 1)) {
            Orion.Print(`Нет ресурсов для ${recipe.name}. Остановка.`);
            Orion.PlayWav('Alarm');
            stopBot();
            return;
          }

          this.prepareMaterials(recipe, 1);

          // Запоминаем количество таких предметов в рюкзаке ДО ковки
          const countBefore = Orion.Count(
            recipe.product.graphic,
            'any',
            'backpack',
          );

          this.craftItem(recipe);

          // Считаем ПОСЛЕ ковки
          const countAfter = Orion.Count(
            recipe.product.graphic,
            'any',
            'backpack',
          );

          if (countAfter > countBefore) {
            isSuccess = true;
            Orion.Print(`${recipe.name} успешно выкован!`);
            this.moveCraftedItems(recipe.product); // Убираем готовую часть в сундук
          } else {
            Orion.Print(`Фейл при ковке ${recipe.name}. Пробуем еще раз...`);
          }
        }
      }
    }
    Orion.Print(`Успешно выковано комплектов: ${this.config.batchSize}!`);
    Orion.PlayWav('AutoPage');
  }

  private hasResourcesFor(recipe: CraftRecipe, amount: number): boolean {
    for (const mat of recipe.materials) {
      const chestAmount = Orion.Count(
        mat.def.graphic,
        mat.def.color,
        this.config.resourcesContainerSerial,
      );
      if (chestAmount < mat.req * amount) {
        return false;
      }
    }
    return true;
  }

  private findAvailableRecipe(): CraftRecipe | null {
    Orion.UseObject(this.config.resourcesContainerSerial);
    Orion.Wait(200);

    for (const recipe of this.config.recipes) {
      if (this.hasResourcesFor(recipe, this.config.batchSize)) {
        return recipe;
      }
    }
    return null;
  }

  private prepareMaterials(recipe: CraftRecipe, amount: number): void {
    for (const matDef of this.allMaterials) {
      const allBackpackMats = Orion.FindType(
        matDef.graphic,
        matDef.color,
        'backpack',
      );
      for (const item of allBackpackMats) {
        Orion.MoveItem(item, 0, this.config.resourcesContainerSerial);
        Orion.Wait(200);
      }
    }

    for (const mat of recipe.materials) {
      const requiredTotal = mat.req * amount;
      let needToTake = requiredTotal;

      while (needToTake > 0) {
        const chestMaterials = Orion.FindType(
          mat.def.graphic,
          mat.def.color,
          this.config.resourcesContainerSerial,
        );
        if (chestMaterials.length === 0) {
          break;
        }

        Orion.MoveItem(chestMaterials[0], needToTake, 'backpack');
        Orion.Wait(100);

        const haveInBackpack = Orion.Count(
          mat.def.graphic,
          mat.def.color,
          'backpack',
        );
        needToTake = requiredTotal - haveInBackpack;
      }
    }
  }

  private craftItem(recipe: CraftRecipe): void {
    checkLag();
    const start = Orion.Now();

    this.config.startCraftAction(recipe);

    let timeout = Orion.Now() + 5000;
    let currentLevel = 0;

    while (Orion.Now() < timeout) {
      if (Orion.WaitForMenu(300)) {
        const menu = Orion.GetMenu('last');
        if (!menu) continue;

        const startSerial = menu.Serial();

        // Идем с конца пути к началу
        for (let i = recipe.path.length - 1; i >= currentLevel; i--) {
          const node = recipe.path[i];

          if (typeof node === 'string') {
            // Если это обычная строка - выбираем по тексту
            menu.Select(node);
          } else {
            // Если это объект с графикой - ищем индекс!
            let targetIndex = -1;
            const count = menu.ItemsCount();

            // 1. Принудительно делаем из нашей графики ('0x1415') десятичное число
            const searchGraphicDec = parseInt(String(node.graphic), 16);

            for (let j = 0; j < count; j++) {
              // 2. Убеждаемся, что значение из меню тоже воспринимается TS как число
              const menuItemGraphicDec = Number(menu.ItemGraphic(j));

              // Теперь мы сравниваем number === number, TypeScript счастлив!
              if (menuItemGraphicDec === searchGraphicDec) {
                targetIndex = j;
                break;
              }
            }

            if (targetIndex !== -1) {
              menu.Select(targetIndex);
            } else {
              Orion.Print(
                `[ОШИБКА] В меню нет предмета с графикой ${node.graphic}`,
              );
              break;
            }
          }

          Orion.Wait(100);

          // Проверяем, сменилось ли окно
          if (
            Orion.MenuCount() === 0 ||
            Orion.GetMenu('last')?.Serial() !== startSerial
          ) {
            currentLevel = i + 1;
            timeout = Orion.Now() + 5000;
            break;
          }
        }
      } else {
        break;
      }
    }

    Orion.CancelWaitTarget();

    const startPattern = this.config.startMessage || 'Производство отнимет';
    const timeMsg = Orion.WaitJournal(
      startPattern,
      start,
      Orion.Now() + 2000,
      'sys|my|any',
    );

    if (timeMsg) {
      const match = timeMsg.Text().match(/(\d+)\s*секунд/);
      if (match) {
        const seconds = parseInt(match[1], 10);
        Orion.Print(`Жду ${seconds} секунд...`);
        const maxWaitingTime = Orion.Now() + seconds * 1000 + 20000;

        Orion.WaitJournal(
          this.endMessages,
          Orion.Now(),
          maxWaitingTime,
          'sys|my',
        );
        Orion.Wait(100);
        return;
      }
    }

    // Резервный вариант
    Orion.WaitJournal(this.endMessages, start, start + 10000, 'sys|my');
    Orion.Wait(100);
  }

  private moveCraftedItems(item: MaterialDef): void {
    const items = Orion.FindType(item.graphic, item.color, 'backpack');
    for (const found of items) {
      checkLag();
      Orion.MoveItem(found, 0, this.config.productsContainerSerial);
      Orion.Wait(100);
    }
  }
}
