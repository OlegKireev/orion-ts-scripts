import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  MaterialDef,
  UniversalCrafter,
  CraftRecipe,
} from '@lib/crafting-engine';

// ==========================================
// ⚙️ НАСТРОЙКИ ПЕРЕД СТАРТОМ
// Изменяй эти значения перед запуском скрипта!
// ==========================================
const TARGET_SETS = 2; // Сколько полных комплектов сковать
const TARGET_MATERIAL = 'Bluesteel'; // Название инготов из словаря MATERIALS
const TYPE: 'plate' | 'chain' = 'chain';

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

// ==========================================
// ФАБРИКА РЕЦЕПТОВ (Генератор полного сета)
// ==========================================
function getPlateSetRecipes(materialName: string): CraftRecipe[] {
  const mat = MATERIALS[materialName];

  if (!mat) {
    Orion.Print(`[ОШИБКА] Материал ${materialName} не найден в словаре!`);
    return [];
  }

  if (TYPE === 'chain') {
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
export function StartArmorCrafting(): void {
  const recipes = getPlateSetRecipes(TARGET_MATERIAL);

  if (recipes.length === 0) {
    return;
  }

  const ArmorConfig: CraftConfig = {
    resourcesContainerSerial: RESOURCE_CONTAINER_SERIAL,
    productsContainerSerial: PRODUCTS_CONTAINER_SERIAL,

    mode: 'set',
    batchSize: TARGET_SETS,
    recipes: recipes,

    startCraftAction: (recipe) => {
      const primaryMaterial = recipe.materials[0].def;
      Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
    },
  };

  const crafter = new UniversalCrafter(ArmorConfig);
  crafter.run();
}

// Глобальное состояние.
// В Orion оно сохранится в памяти, пока макрос не выгрузят.
// Это удобно: при следующем запуске гамп запомнит твой прошлый выбор!
let craftState = {
  type: 'plate' as 'plate' | 'chain',
  material: 'Copper',
  count: 1,
};

const AVAILABLE_MATERIALS = [
  'Rusty',
  'OldCopper',
  'Bronze',
  'Copper',
  'Steel',
  'Silver',
];

export function CraftMenu() {
  const gumpSerial = 777; // Уникальный ID нашего гампа
  let isRunning = true;

  while (isRunning) {
    const w = 320;
    const h = 280;
    // Центрируем или ставим в удобное место
    const x = Orion.ClientOptionGet('GameWindowX') + 100;
    const y = Orion.ClientOptionGet('GameWindowY') + 100;

    const gump = Orion.CreateCustomGump(gumpSerial);
    gump.Clear();
    gump.SetX(x);
    gump.SetY(y);
    gump.SetNoClose(false);
    gump.SetNoMove(false);

    // При клике на кнопку гамп закрывается, срабатывает коллбек,
    // мы меняем стейт и цикл сразу же рисует его заново с новыми данными!
    gump.SetCloseOnButtonClick(true);
    gump.SetCallback('CraftGumpCallback');

    // Фон гампа
    gump.AddResizepic(0, 0, '0x0A28', w, h);
    gump.AddText(80, 20, 1153, 'Настройки Крафта Брони');

    // --- СЕКЦИЯ 1: ТИП БРОНИ ---
    gump.AddText(20, 60, 0, 'Тип:');

    const plateColor = craftState.type === 'plate' ? 63 : 0; // 63 - зеленый цвет для выбранного
    gump.AddButton(
      101,
      60,
      64,
      toGraphic('0x0845'),
      toGraphic('0x0846'),
      toGraphic('0x0847'),
      toGraphic('0x0848'),
    );
    gump.AddText(80, 60, plateColor, 'Plate');

    const chainColor = craftState.type === 'chain' ? 63 : 0;
    gump.AddButton(
      101,
      60,
      64,
      toGraphic('0x0845'),
      toGraphic('0x0846'),
      toGraphic('0x0847'),
      toGraphic('0x0848'),
    );
    gump.AddText(160, 60, chainColor, 'Chain');

    // --- СЕКЦИЯ 2: МАТЕРИАЛ ---
    gump.AddText(20, 100, 0, 'Материал:');

    AVAILABLE_MATERIALS.forEach((mat, index) => {
      const col = index % 2; // В две колонки
      const row = Math.floor(index / 2);
      const matX = 100 + col * 100;
      const matY = 100 + row * 25;

      const matColor = craftState.material === mat ? 63 : 0;

      // ID кнопок материалов начинаются с 200
      gump.AddButton(
        200 + index,
        matX - 20,
        matY + 4,
        toGraphic('0x0845'),
        toGraphic('0x0846'),
        toGraphic('0x0847'),
        toGraphic('0x0848'),
      );
      gump.AddText(matX, matY, matColor, mat);
    });

    // --- СЕКЦИЯ 3: КОЛИЧЕСТВО ---
    gump.AddText(20, 190, 0, `Сделать сетов:  ${craftState.count} шт.`);
    // Минус (код 301) и Плюс (код 302)
    gump.AddButton(
      301,
      190,
      194,
      toGraphic('0x0845'),
      toGraphic('0x0846'),
      toGraphic('0x0847'),
      toGraphic('0x0848'),
    ); // Кнопка со стрелочкой вниз/минус
    gump.AddButton(
      302,
      215,
      194,
      toGraphic('0x0845'),
      toGraphic('0x0846'),
      toGraphic('0x0847'),
      toGraphic('0x0848'),
    ); // Кнопка со стрелочкой вверх/плюс

    // --- СЕКЦИЯ 4: УПРАВЛЕНИЕ ---
    gump.AddButton(
      999,
      50,
      230,
      toGraphic('0x0845'),
      toGraphic('0x0846'),
      toGraphic('0x0847'),
      toGraphic('0x0848'),
    ); // START (OK)
    gump.AddButton(
      0,
      180,
      230,
      toGraphic('0x0845'),
      toGraphic('0x0846'),
      toGraphic('0x0847'),
      toGraphic('0x0848'),
    ); // CANCEL

    gump.Update();

    // Сбрасываем переменную ожидания перед входом в цикл
    Shared.AddVar('craftGumpCode', -1);

    // Ждем реакции пользователя (пока гамп существует и переменная не изменилась)
    while (
      Orion.GumpExists('custom', gumpSerial) &&
      Shared.GetVar('craftGumpCode') === -1
    ) {
      Orion.Wait(50);
    }

    const code = Shared.GetVar('craftGumpCode');

    // Обрабатываем результат
    switch (code) {
      case 101:
        craftState.type = 'plate';
        break;
      case 102:
        craftState.type = 'chain';
        break;

      // Обработка материалов (от 200 до 200 + длина массива)
      case 200:
      case 201:
      case 202:
      case 203:
      case 204:
      case 205:
        const matIndex = code - 200;
        craftState.material = AVAILABLE_MATERIALS[matIndex];
        break;

      case 301:
        if (craftState.count > 1) craftState.count--;
        break;
      case 302:
        craftState.count++;
        break;

      case 999: // Нажали START
        Orion.Print(
          `[Запуск]: Ковка ${craftState.count} сетов ${craftState.type} из ${craftState.material}`,
        );
        isRunning = false;
        break;

      default: // Нажали Cancel (0) или закрыли гамп ПКМ
        Orion.Print('Настройка крафта отменена.');
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
