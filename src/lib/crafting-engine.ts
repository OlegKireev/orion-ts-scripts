import { Item } from '@/constants/items';
import { checkLag, moveItem, stopBot } from './helpers';
import { sendTelegramMessage } from './telegram';

// ==========================================
// ИНТЕРФЕЙСЫ
// ==========================================
export type MenuPathNode = string | number;

export interface CraftRecipe {
  /** Название предмета */
  name: string;
  /** Полный путь пунктов меню, например ["executioner's axe", 'mace', 'War Mace'] */
  path: MenuPathNode[];
  /** Graphic и color предмета, и куда его класть */
  product: {
    def: Item;
    container?: Serial;
  };
  /** Какие материалы, сколько и откуда брать на крафт 1 предмета  */
  materials: { def: Item; req: number; container: Serial }[];
}

export interface CraftConfig {
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
  /** Коллбэк, вызываемый во время ожидания крафта. availableMs — оставшееся время ожидания в мс */
  onCraftWait?: (availableMs: number) => void;
}

// ==========================================
// ДВИЖОК
// ==========================================
export class UniversalCrafter {
  private config: CraftConfig;
  private endMessages: string;
  private allMaterials: { def: Item; container: Serial }[] = [];
  private successCount: number = 0;
  private failCount: number = 0;

  constructor(config: CraftConfig) {
    this.config = config;
    this.endMessages =
      config.endMessage ||
      'You put the|You failed|You have no|You have gainer|Ваша попытка провалилась|Вы успешно сделали';

    const uniqueMaterials: Record<string, { def: Item; container: Serial }> =
      {};

    for (const recipe of config.recipes) {
      for (const material of recipe.materials) {
        const key = `${material.def.graphic}_${material.def.color}`;
        uniqueMaterials[key] = material;
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
        this.printStats();
        this.printRemainingResources();
        stopBot();
        return;
      }
      this.prepareMaterials(recipeToCraft, this.config.batchSize);
      for (let i = 0; i < this.config.batchSize; i++) {
        const countBefore = Orion.Count(
          recipeToCraft.product.def.graphic,
          'any',
          'backpack',
        );
        this.craftItem(recipeToCraft);
        const countAfter = Orion.Count(
          recipeToCraft.product.def.graphic,
          'any',
          'backpack',
        );
        if (countAfter > countBefore) {
          this.successCount++;
        } else {
          this.failCount++;
        }
        this.printStats();
        this.printRemainingResources();
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
            sendTelegramMessage(
              `**${Player.Name()}:** Закончились ресурсы для крафта`,
            );
            return;
          }

          this.prepareMaterials(recipe, 1);

          // Запоминаем количество таких предметов в рюкзаке ДО ковки
          const countBefore = Orion.Count(
            recipe.product.def.graphic,
            'any',
            'backpack',
          );

          this.craftItem(recipe);

          // Считаем ПОСЛЕ ковки
          const countAfter = Orion.Count(
            recipe.product.def.graphic,
            'any',
            'backpack',
          );

          if (countAfter > countBefore) {
            isSuccess = true;
            this.successCount++;
            Orion.Print(`${recipe.name} успешно создан!`);
            this.moveCraftedItems(recipe.product); // Убираем готовую часть в сундук
          } else {
            this.failCount++;
            Orion.Print(`Фейл при крафте ${recipe.name}. Пробуем еще раз...`);
          }
          this.printStats();
          this.printRemainingResources();
        }
      }
    }
    Orion.Print(`Успешно создано комплектов: ${this.config.batchSize}!`);
    Orion.PlayWav('AutoPage');
  }

  private printStats(): void {
    const total = this.successCount + this.failCount;
    if (total === 0) {
      return;
    }
    const successRate = ((this.successCount / total) * 100).toFixed(1);
    const failRate = ((this.failCount / total) * 100).toFixed(1);
    Orion.Print(
      `Статистика: попыток ${total} | успехов ${this.successCount} (${successRate}%) | фейлов ${this.failCount} (${failRate}%)`,
    );
  }

  private printRemainingResources(): void {
    for (const recipe of this.config.recipes) {
      let minItems = Infinity;
      for (const mat of recipe.materials) {
        const chestAmount = Orion.Count(
          mat.def.graphic,
          mat.def.color,
          mat.container,
        );
        const possible = Math.floor(chestAmount / mat.req);
        if (possible < minItems) {
          minItems = possible;
        }
      }
      const remaining = minItems === Infinity ? 0 : minItems;
      Orion.Print(`Осталось ресурсов на ${recipe.name}: ${remaining} шт.`);
    }
  }

  private hasResourcesFor(recipe: CraftRecipe, amount: number): boolean {
    for (const mat of recipe.materials) {
      const chestAmount = Orion.Count(
        mat.def.graphic,
        mat.def.color,
        mat.container,
      );
      if (chestAmount < mat.req * amount) {
        return false;
      }
    }
    return true;
  }

  private findAvailableRecipe(): CraftRecipe | null {
    for (const recipe of this.config.recipes) {
      for (const material of recipe.materials) {
        Orion.UseObject(material.container);
        Orion.Wait(100);
      }

      if (this.hasResourcesFor(recipe, this.config.batchSize)) {
        return recipe;
      }
    }
    return null;
  }

  private prepareMaterials(recipe: CraftRecipe, amount: number): void {
    for (const material of this.allMaterials) {
      const allBackpackMaterials = Orion.FindType(
        material.def.graphic,
        material.def.color,
        'backpack',
      );
      for (const item of allBackpackMaterials) {
        moveItem(item, 0, material.container);
      }
    }

    for (const mat of recipe.materials) {
      const requiredTotal = mat.req * amount;
      let needToTake = requiredTotal;

      while (needToTake > 0) {
        const chestMaterials = Orion.FindType(
          mat.def.graphic,
          mat.def.color,
          mat.container,
        );
        if (chestMaterials.length === 0) {
          break;
        }

        moveItem(chestMaterials[0], needToTake, 'backpack');

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
          menu.Select(node);
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
        const craftDuration = seconds * 1000;
        const craftEndTime = Orion.Now() + craftDuration;
        const serverDelayFactor = craftDuration * 0.3; // 30% от времени на сервере
        const maxWaitingTime = craftEndTime + serverDelayFactor;

        this.waitForCraftResult(craftEndTime, maxWaitingTime);
        Orion.Wait(100);
        return;
      }
    }

    // Резервный вариант
    this.waitForCraftResult(start + 10000, start + 10000);
    Orion.Wait(100);
  }

  private waitForCraftResult(
    craftEndTime: number,
    maxWaitingTime: number,
  ): void {
    const waitStart = Orion.Now();
    if (this.config.onCraftWait) {
      // Поллинг: проверяем журнал короткими интервалами, между ними тренируемся
      while (Orion.Now() < maxWaitingTime) {
        const remaining = craftEndTime - Orion.Now();
        if (remaining > 0) {
          this.config.onCraftWait(remaining);
        }
        // После каждого действия тренировки проверяем, не пришёл ли результат крафта
        if (Orion.InJournal(this.endMessages, 'sys|my', '', '', waitStart)) {
          break;
        }
        Orion.Wait(100);
      }
      // Если результат так и не пришёл за время поллинга — ждём оставшееся
      if (!Orion.InJournal(this.endMessages, 'sys|my', '', '', waitStart)) {
        Orion.WaitJournal(
          this.endMessages,
          waitStart,
          maxWaitingTime,
          'sys|my',
        );
      }
    } else {
      // Без коллбэка — старое поведение
      Orion.WaitJournal(this.endMessages, waitStart, maxWaitingTime, 'sys|my');
    }
  }

  private moveCraftedItems(product: { def: Item; container?: Serial }): void {
    if (!product.container) {
      return;
    }
    const items = Orion.FindType(
      product.def.graphic,
      product.def.color,
      'backpack',
    );
    for (const found of items) {
      checkLag();
      moveItem(found, 0, product.container);
    }
  }
}
