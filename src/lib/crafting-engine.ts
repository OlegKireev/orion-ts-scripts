import { checkLag, stopBot } from './helpers';
import { sendTelegramMessage } from './telegram';

// ==========================================
// ИНТЕРФЕЙСЫ
// ==========================================
export interface MaterialDef {
  graphic: Graphic;
  color: string;
}

export interface CraftRecipe {
  name: string;
  path: string[];
  product: MaterialDef;
  materials: { def: MaterialDef; req: number }[];
}

export interface CraftConfig {
  chestSerial: Serial;
  trashSerial: Serial;
  batchSize: number;
  recipes: CraftRecipe[];
  allMaterials: MaterialDef[]; // Список всех возможных материалов для очистки сумки

  // Функция старта: описывает, как именно вызвать меню крафта
  startCraftAction: (recipe: CraftRecipe) => void;

  // Опциональные сообщения (если на разных навыках они отличаются)
  msgStartPattern?: string;
  msgEndPattern?: string;
}

// ==========================================
// ДВИЖОК
// ==========================================
export class UniversalCrafter {
  private config: CraftConfig;
  private endMessages: string;

  constructor(config: CraftConfig) {
    this.config = config;
    this.endMessages =
      config.msgEndPattern ||
      'You put the|You failed|You have no|You have gainer|Ваша попытка провалилась';
  }

  public run(): void {
    Orion.Print('Запуск универсального крафтера...');
    Orion.CancelWaitMenu();

    while (true) {
      const recipeToCraft = this.findAvailableRecipe();

      if (!recipeToCraft) {
        const message = 'Нет ресурсов ни на один предмет из списка. Остановка.';
        Orion.Print(message);
        Orion.PlayWav('Alarm');
        sendTelegramMessage(message);
        stopBot();
        return;
      }

      Orion.Print(`Будем делать: ${recipeToCraft.name}`);
      this.prepareMaterials(recipeToCraft);

      for (let i = 0; i < this.config.batchSize; i++) {
        this.craftItem(recipeToCraft);
        this.trashCraftedItems(recipeToCraft.product);
      }
    }
  }

  private findAvailableRecipe(): CraftRecipe | null {
    Orion.UseObject(this.config.chestSerial);
    Orion.Wait(200);

    for (const recipe of this.config.recipes) {
      let canCraft = true;

      for (const mat of recipe.materials) {
        const chestAmount = Orion.Count(
          mat.def.graphic,
          mat.def.color,
          this.config.chestSerial,
        );
        if (chestAmount < mat.req * this.config.batchSize) {
          canCraft = false;
          break;
        }
      }
      if (canCraft) return recipe;
    }
    return null;
  }

  private prepareMaterials(recipe: CraftRecipe): void {
    // 1. Скидываем АБСОЛЮТНО ВСЕ профильные материалы из сумки в сундук
    for (const matDef of this.config.allMaterials) {
      const allBackpackMats = Orion.FindType(
        matDef.graphic,
        matDef.color,
        'backpack',
      );
      for (const item of allBackpackMats) {
        Orion.MoveItem(item, 0, this.config.chestSerial);
        Orion.Wait(200);
      }
    }

    // 2. Берем только нужные
    for (const mat of recipe.materials) {
      const requiredTotal = mat.req * this.config.batchSize;
      let needToTake = requiredTotal;

      while (needToTake > 0) {
        const chestMaterials = Orion.FindType(
          mat.def.graphic,
          mat.def.color,
          this.config.chestSerial,
        );
        if (chestMaterials.length === 0) {
          break;
        }

        Orion.MoveItem(chestMaterials[0], needToTake, 'backpack');
        Orion.Wait(200);

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

    // ВЫЗЫВАЕМ КАСТОМНЫЙ СТАРТЕР МЕНЮ ИЗ КОНФИГА
    this.config.startCraftAction(recipe);

    let timeout = Orion.Now() + 5000;
    let currentLevel = 0;

    // Обход динамического меню
    while (Orion.Now() < timeout) {
      if (Orion.WaitForMenu(300)) {
        const menu = Orion.GetMenu('last');
        if (!menu) continue;

        const startSerial = menu.Serial();

        for (let i = recipe.path.length - 1; i >= currentLevel; i--) {
          menu.Select(recipe.path[i]);
          Orion.Wait(100);

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

    // Ожидание финала
    const startPattern = this.config.msgStartPattern || 'Производство отнимет';
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
          'sys|my|any',
        );
        Orion.Wait(300);
        return;
      }
    }

    // Резервный вариант
    Orion.WaitJournal(this.endMessages, start, start + 10000, 'sys|my|any');
    Orion.Wait(300);
  }

  private trashCraftedItems(item: MaterialDef): void {
    const items = Orion.FindType(item.graphic, item.color, 'backpack');
    for (const found of items) {
      checkLag();
      Orion.MoveItem(found, 0, this.config.trashSerial);
      Orion.Wait(600);
    }
  }
}
