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
const TARGET_MATERIAL = 'Bronze'; // Название инготов из словаря MATERIALS

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

  return [
    {
      name: `${materialName} Plate Chest`,
      path: ['Colored Armor', { graphic: toGraphic('0x1415') }],
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
