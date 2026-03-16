import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  MaterialDef,
  UniversalCrafter,
  CraftRecipe,
} from '@lib/crafting-engine';
import { checkLag } from '@/lib/helpers';

// ==========================================
// ⚙️ НАСТРОЙКИ ПЕРЕД СТАРТОМ
// Изменяй эти значения перед запуском скрипта!
// ==========================================
const RESOURCE_CONTAINER_SERIAL = toSerial('0x403853AB'); // Откуда брать инготы
const PRODUCTS_CONTAINER_SERIAL = toSerial('0x403853A9'); // Куда складывать готовую броню

// Справочник материалов
const MATERIALS: Record<string, MaterialDef> = {
  Rusty: { graphic: toGraphic('0x1BEF'), color: '0x09EB' },
  OldCopper: { graphic: toGraphic('0x1BEF'), color: '0x09E8' },
  Bronze: { graphic: toGraphic('0x1BEF'), color: '0x06D6' },
  Copper: { graphic: toGraphic('0x1BE3'), color: '0x0000' },
  Steel: { graphic: toGraphic('0x1BEF'), color: '0x09F1' },
  Silver: { graphic: toGraphic('0x1BF5'), color: '0x0000' },
  Gold: { graphic: toGraphic('0x1BE9'), color: '0x09B5' },
  Shadow: { graphic: toGraphic('0x1BEF'), color: '0x0770' },
  Bluesteel: { graphic: toGraphic('0x1BEF'), color: '0x0128' },
  Rose: { graphic: toGraphic('0x1BEF'), color: '0x0665' },
  Agapite: { graphic: toGraphic('0x1BEF'), color: '0x0400' },
  Bloodrock: { graphic: toGraphic('0x1BEF'), color: '0x09CF' },
  Verite: { graphic: toGraphic('0x1BEF'), color: '0x0BAA' },
  Valorite: { graphic: toGraphic('0x1BEF'), color: '0x0515' },
  Mytheril: { graphic: toGraphic('0x1BEF'), color: '0x052D' },
  Blackrock: { graphic: toGraphic('0x1BEF'), color: '0x0455' },
};

// Глобальное состояние.
// В Orion оно сохранится в памяти, пока макрос не выгрузят.
// Это удобно: при следующем запуске гамп запомнит твой прошлый выбор!
let state = {
  type: 'plate' as 'plate' | 'chain',
  material: 'Bluesteel',
  count: 1,
};
// ==========================================
// ФАБРИКА РЕЦЕПТОВ (Генератор полного сета)
// ==========================================
function getPlateSetRecipes(materialName: string): CraftRecipe[] {
  const mat = MATERIALS[materialName];

  if (!mat) {
    Orion.Print(`[ОШИБКА] Материал ${materialName} не найден в словаре!`);
    return [];
  }

  if (state.type === 'chain') {
    return [
      {
        name: `${materialName} chainmail coif`,
        path: ['Colored Armor', 'Chainmail Coif'],
        product: { graphic: toGraphic('0x13BB'), color: 'any' },
        materials: [{ def: mat, req: 10 }],
      },
      {
        name: `${materialName} chainmail leggings`,
        path: ['Colored Armor', 'Chainmail Leggings'],
        product: { graphic: toGraphic('0x13BE'), color: 'any' },
        materials: [{ def: mat, req: 18 }],
      },
      {
        name: `${materialName} chainmail tunic`,
        path: ['Colored Armor', 'Chainmail tunic'],
        product: { graphic: toGraphic('0x13BF'), color: 'any' },
        materials: [{ def: mat, req: 20 }],
      },
      {
        name: `${materialName} ringmail gloves`,
        path: ['Colored Armor', 'Ringmail Gloves'],
        product: { graphic: toGraphic('0x13EB'), color: 'any' },
        materials: [{ def: mat, req: 10 }],
      },
      {
        name: `${materialName} ringmail sleeves`,
        path: ['Colored Armor', 'Ringmail Sleeves'],
        product: { graphic: toGraphic('0x13EE'), color: 'any' },
        materials: [{ def: mat, req: 14 }],
      },
    ];
  }

  return [
    {
      name: `${materialName} Plate Chest`,
      path: ['Colored Armor', '6'],
      product: { graphic: toGraphic('0x1415'), color: 'any' },
      materials: [{ def: mat, req: 28 }],
    },
    {
      name: `${materialName} Plate Helmet`,
      path: ['Colored Armor', 'Helmet'],
      product: { graphic: toGraphic('0x1412'), color: 'any' },
      materials: [{ def: mat, req: 15 }],
    },
    {
      name: `${materialName} Plate Gorget`,
      path: ['Colored Armor', 'Gorget'],
      product: { graphic: toGraphic('0x1413'), color: 'any' },
      materials: [{ def: mat, req: 8 }],
    },
    {
      name: `${materialName} Plate Gauntlets`,
      path: ['Colored Armor', 'Gauntlets'],
      product: { graphic: toGraphic('0x1414'), color: 'any' },
      materials: [{ def: mat, req: 14 }],
    },
    {
      name: `${materialName} Plate Arms`,
      path: ['Colored Armor', 'Arms'],
      product: { graphic: toGraphic('0x1410'), color: 'any' },
      materials: [{ def: mat, req: 18 }],
    },
    {
      name: `${materialName} Plate Leggings`,
      path: ['Colored Armor', 'Leggings'],
      product: { graphic: toGraphic('0x1411'), color: 'any' },
      materials: [{ def: mat, req: 20 }],
    },
  ];
}

// ==========================================
// ЗАПУСК
// ==========================================
function StartArmorCrafting(): void {
  const recipes = getPlateSetRecipes(state.material);

  if (recipes.length === 0) {
    return;
  }

  const ArmorConfig: CraftConfig = {
    resourcesContainerSerial: RESOURCE_CONTAINER_SERIAL,
    productsContainerSerial: PRODUCTS_CONTAINER_SERIAL,

    mode: 'set',
    batchSize: state.count,
    recipes: recipes,

    startCraftAction: (recipe) => {
      const primaryMaterial = recipe.materials[0].def;
      Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
    },
  };

  const crafter = new UniversalCrafter(ArmorConfig);
  crafter.run();
}

const AVAILABLE_MATERIALS = Object.keys(MATERIALS);

export function CraftMenu() {
  const gumpSerial = 777; // Уникальный ID нашего гампа
  let isRunning = true;

  while (isRunning) {
    const w = 320;
    const h = 440;
    const x = Orion.ClientOptionGet("GameWindowX") + 100;
    const y = Orion.ClientOptionGet("GameWindowY") + 100;

    const gump = Orion.CreateCustomGump(gumpSerial);
    gump.Clear();
    gump.SetX(x);
    gump.SetY(y);
    gump.SetNoClose(false);
    gump.SetNoMove(false);
    gump.SetCloseOnButtonClick(true);
    gump.SetCallback("CraftGumpCallback");

    // Фон гампа
    gump.AddResizepic(0, 0, "0x0A28", w, h);
    gump.AddText(80, 20, 1153, "Крафт сетов брони");

    // --- СЕКЦИЯ 1: ТИП БРОНИ ---
    gump.AddText(20, 60, 0, "Тип:");

    const plateColor = state.type === 'plate' ? 63 : 0;
    gump.AddButton(101, 60, 69, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
    gump.AddText(80, 65, plateColor, "Plate");
    gump.AddTilePic(120, 60, toGraphic('0x1415'), 0, 101, '');

    const chainColor = state.type === 'chain' ? 63 : 0;
    gump.AddButton(102, 185, 69, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
    gump.AddText(205, 65, chainColor, "Chain");
    gump.AddTilePic(240, 60, toGraphic('0x13BF'), 0, 102, '');

    // --- СЕКЦИЯ 2: МАТЕРИАЛ ---
    gump.AddText(20, 105, 0, "Материал:");

    AVAILABLE_MATERIALS.forEach((mat, index) => {
        const col = index % 2; // В две колонки
        const row = Math.floor(index / 2);
        const matX = 20 + (col * 140);
        const matY = 130 + (row * 25);

        const matColor = state.material === mat ? 63 : 0;

        gump.AddButton(200 + index, matX, matY + 4, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
        gump.AddText(matX + 20, matY, matColor, mat);
    });

    // --- СЕКЦИЯ 3: КОЛИЧЕСТВО ---
    gump.AddText(20, 340, 0, `Кол-во сетов:  ${state.count} шт.`);

    gump.AddButton(301, 200, 344, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
    gump.AddText(220, 340, 0, "-1");

    gump.AddButton(302, 250, 344, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
    gump.AddText(270, 340, 0, "+1");

    // --- СЕКЦИЯ 4: УПРАВЛЕНИЕ ---
    gump.AddButton(0, 40, 385, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
    gump.AddText(60, 381, 0, "Отмена");

    gump.AddButton(999, 180, 385, toGraphic("0x0845"), toGraphic("0x0846"), toGraphic("0x0845"), toGraphic('0x0000'));
    gump.AddText(200, 381, 63, "Ковать");

    gump.Update();

    Orion.Wait(100);

    // Записываем 0. Если игрок закроет окно крестиком/ПКМ, останется 0 (Отмена)
    Shared.AddVar("craftGumpCode", -1);

    // Ждем ТОЛЬКО закрытия гампа
    while (Orion.GumpExists("custom", gumpSerial) && Shared.GetVar("craftGumpCode") === -1) {
        Orion.Wait(50);
    }

    // ВАЖНО: Даем Ориону еще 50мс, чтобы коллбек точно успел отработать и перезаписать переменную
    Orion.Wait(50);

    let code = Shared.GetVar("craftGumpCode");

    if (code === -1) {
      code = 0;
    }

    // Обрабатываем результат
    switch (code) {
      case 101:
        state.type = 'plate';
        break;
      case 102:
        state.type = 'chain';
        break;

      // Блок материалов (Обязательно оборачиваем в { } чтобы не было ошибки области видимости)
      case 200: case 201: case 202: case 203: case 204: case 205: case 206: case 207: case 208: case 209: case 210: case 211: case 212: case 213: case 214: case 215: case 216: {
        const matIndex = code - 200;
        state.material = AVAILABLE_MATERIALS[matIndex];
        break;
      }

      case 301:
        if (state.count > 1) state.count--;
        break;
      case 302:
        state.count++;
        break;

      case 999: // Нажали START
        Orion.Print(`[Запуск]: Кую ${state.count} сетов ${state.type} из ${state.material}`);
        StartArmorCrafting();
        isRunning = false;
        break;

      case 0:
      default:
        Orion.Print("Настройка крафта отменена.");
        isRunning = false;
        break;
    }
  }
}


/**
 * Этот коллбек вызывается самим Орионом при нажатии любой кнопки в нашем кастомном гампе.
 * Обязательно должен быть экспортирован.
 */
export function CraftGumpCallback() {
  const code = CustomGumpResponse.ReturnCode();
  Shared.AddVar('craftGumpCode', code);
}

export function Autostart() {
  checkLag();
  if (!Orion.ScriptRunning('CraftMenu')) {
    Orion.Exec('CraftMenu', true);
  }
}