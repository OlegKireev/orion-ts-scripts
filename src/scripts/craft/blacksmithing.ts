import { toGraphic, toSerial } from '@lib/validators';
import { checkLag, stopBot } from '@/lib/helpers';

// ==========================================
// НАСТРОЙКИ
// ==========================================
const CHEST_SERIAL = toSerial('0x403853AB');
const TRASH_SERIAL = toSerial('0x40215610');
const BATCH_SIZE = 3;

// Описываем структуру одного материала
interface MaterialDef {
  graphic: Graphic;
  color: string;
}

// Теперь каждый материал имеет и графику, и цвет
const MATERIALS: Record<string, MaterialDef> = {
  Rusty: { graphic: toGraphic('0x1BEF'), color: '0x09EB' },
  OldCopper: { graphic: toGraphic('0x1BEF'), color: '0x09E8' },
  Bronze: { graphic: toGraphic('0x1BEF'), color: '0x06D6' },
  Copper: { graphic: toGraphic('0x1BE3'), color: '0x0000' },
  Steel: { graphic: toGraphic('0x1BEF'), color: '0x09F1' },
  Silver: { graphic: toGraphic('0x1BF5'), color: '0x0000' },
};

// ==========================================
// РЕЦЕПТЫ В ПОРЯДКЕ ПРИОРИТЕТА
// ==========================================
interface CraftRecipe {
  name: string;
  path: string[];
  product: MaterialDef;
  materials: { def: MaterialDef; req: number }[]; // Связываем с определением материала
}

const RECIPES: CraftRecipe[] = [
  {
    name: 'War Mace',
    path: ["executioner's axe", 'mace', 'War Mace'],
    product: {
      graphic: toGraphic('0x13B3'),
      color: toGraphic('0x0909'),
    },
    materials: [
      { def: MATERIALS.Copper, req: 10 },
      { def: MATERIALS.OldCopper, req: 10 },
    ],
  },
  {
    name: 'Orcish Mace',
    path: ["executioner's axe", 'mace', 'Orcish Mace'],
    product: {
      graphic: toGraphic('0x13B3'),
      color: toGraphic('0x0A7E'),
    },
    materials: [
      { def: MATERIALS.Bronze, req: 7 },
      { def: MATERIALS.Rusty, req: 15 },
    ],
  },
  {
    name: 'Sting',
    path: ["executioner's axe", 'kryss', 'Sting'],
    product: {
      graphic: toGraphic('0x1400'),
      color: toGraphic('0x0058'),
    },
    materials: [
      { def: MATERIALS.Steel, req: 5 },
      { def: MATERIALS.Silver, req: 5 },
    ],
  },
];

// ==========================================
// ОСНОВНАЯ ЛОГИКА
// ==========================================

export function Autostart(): void {
  Orion.Print('Запуск кузнеца...');
  Orion.CancelWaitMenu();

  while (true) {
    // 1. Ищем рецепт, на который хватает ресурсов
    const recipeToCraft = findAvailableRecipe();

    if (!recipeToCraft) {
      Orion.Print('Нет ресурсов ни на один предмет из списка. Остановка.');
      Orion.PlayWav('Alarm');
      stopBot();
      return;
    }

    Orion.Print(`Будем ковать: ${recipeToCraft.name}`);

    // 2. Подготавливаем инготы (скидываем всё, берем ровно на 3 крафта)
    prepareIngots(recipeToCraft);

    // 3. Куем BATCH_SIZE раз
    for (let i = 0; i < BATCH_SIZE; i++) {
      craftItem(recipeToCraft);
      // 4. Выбрасываем готовое в мусорку
      trashCraftedItems(recipeToCraft.product);
    }
  }
}

/** Ищет первый по списку рецепт, на который в сундуке есть ресы минимум на BATCH_SIZE крафтов */
function findAvailableRecipe(): CraftRecipe | null {
  Orion.UseObject(CHEST_SERIAL);
  Orion.Wait(200);

  for (const recipe of RECIPES) {
    let canCraft = true;

    for (const mat of recipe.materials) {
      // Используем и графику, и цвет из определения материала
      const chestAmount = Orion.Count(
        mat.def.graphic,
        mat.def.color,
        CHEST_SERIAL,
      );

      if (chestAmount < mat.req * BATCH_SIZE) {
        canCraft = false;
        break;
      }
    }

    if (canCraft) return recipe;
  }

  return null;
}

/** Очищает рюкзак от лишней руды и берет точное количество нужной */
function prepareIngots(recipe: CraftRecipe): void {
  // 1. Скидываем АБСОЛЮТНО ВСЕ возможные материалы из сумки в сундук
  // Чтобы не перечислять все типы инготов, мы просто пробегаемся по нашему словарю MATERIALS
  for (const key in MATERIALS) {
    const matDef = MATERIALS[key];
    const allBackpackMats = Orion.FindType(
      matDef.graphic,
      matDef.color,
      'backpack',
    );

    for (const item of allBackpackMats) {
      Orion.MoveItem(item, 0, CHEST_SERIAL);
      Orion.Wait(200);
    }
  }

  // 2. Берем только нужные для текущего рецепта
  for (const mat of recipe.materials) {
    const requiredTotal = mat.req * BATCH_SIZE;
    let needToTake = requiredTotal;

    while (needToTake > 0) {
      const chestMats = Orion.FindType(
        mat.def.graphic,
        mat.def.color,
        CHEST_SERIAL,
      );
      if (chestMats.length === 0) break;

      Orion.MoveItem(chestMats[0], needToTake, 'backpack');
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

/** Процесс ковки с обходом динамических меню */
function craftItem(recipe: CraftRecipe): void {
  checkLag();

  const primaryMaterial = recipe.materials[0].def;

  const start = Orion.Now();

  Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');

  let timeout = Orion.Now() + 5000;
  let currentLevel = 0;

  while (Orion.Now() < timeout) {
    if (Orion.WaitForMenu(300)) {
      const menu = Orion.GetMenu('last');
      if (!menu) {
        continue;
      }

      const startSerial = menu.Serial();

      // Идем с конца пути к началу (от названия пушки к базовой категории)
      for (let i = recipe.path.length - 1; i >= currentLevel; i--) {
        menu.Select(recipe.path[i]);
        Orion.Wait(100);

        // Если меню пропало (MenuCount === 0) или сменило серийник (открылось вложенное)
        if (
          Orion.MenuCount() === 0 ||
          Orion.GetMenu('last')?.Serial() !== startSerial
        ) {
          currentLevel = i + 1; // Сдвигаем базовый уровень
          timeout = Orion.Now() + 5000; // Продлеваем таймаут
          break;
        }
      }
    } else {
      // Если меню не появилось, значит мы успешно выбрали последний пункт и началась ковка
      break;
    }
  }

  Orion.CancelWaitTarget();

  // Ждем максимум 2 секунды, пока сервер не пришлет системное сообщение со временем
  const timeMsg = Orion.WaitJournal("Производство отнимет", start, Orion.Now() + 2000, "sys|my");
  const endMessages = 'You put the|You failed|You have no|You have gainer|Ваша попытка провалилась';

  if (timeMsg) {
      const text = timeMsg.Text();
      const match = text.match(/(\d+)\s*секунд/);

      if (match) {
          const seconds = parseInt(match[1], 10);
          Orion.Print(`Крафчу ${recipe.name}. Жду ${seconds} секунд...`);


          // Таймаут = заявленные секунды + 20 секунд запаса на серверные лаги
          const maxWaitingTime = Orion.Now() + (seconds * 1000) + 20000;
          Orion.WaitJournal(endMessages, Orion.Now(), maxWaitingTime, 'sys|my');
          Orion.Wait(300);
          return;
      } else {
        Orion.Print(`[ОШИБКА]: Сообщение о времени крафта не найдено.`)
      }
  }

  trashCraftedItems(recipe.product);

  // Резерный вариант
  Orion.WaitJournal(
    endMessages,
    start,
    start + 10000,
    'sys|my',
  );
  Orion.Wait(300);
}

/** Скидывает готовые предметы в мусорку */
function trashCraftedItems(item: MaterialDef): void {
  const items = Orion.FindType(item.graphic, item.color, 'backpack');
  for (const item of items) {
    checkLag();
    Orion.MoveItem(item, 0, TRASH_SERIAL);
    Orion.Wait(600);
  }
}
