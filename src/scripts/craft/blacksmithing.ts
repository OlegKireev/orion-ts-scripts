import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  type MaterialDef,
  UniversalCrafter,
} from '@/lib/crafting-engine';

const MATERIALS: Record<string, MaterialDef> = {
  Rusty: { graphic: toGraphic('0x1BEF'), color: '0x09EB' },
  OldCopper: { graphic: toGraphic('0x1BEF'), color: '0x09E8' },
  DullCopper: { graphic: toGraphic('0x1BEF'), color: '0x060A' },
  Bronze: { graphic: toGraphic('0x1BEF'), color: '0x06D6' },
  Copper: { graphic: toGraphic('0x1BE3'), color: '0x0000' },
  Steel: { graphic: toGraphic('0x1BEF'), color: '0x09F1' },
  Silver: { graphic: toGraphic('0x1BF5'), color: '0x0000' },
  Gold: { graphic: toGraphic('0x1BE9'), color: '0x09B5' },
  Shadow: { graphic: toGraphic('0x1BEF'), color: '0x0770' },
  BlueSteel: { graphic: toGraphic('0x1BEF'), color: '0x0128' },
} as const;

const BlacksmithConfig: CraftConfig = {
  resourcesContainerSerial: toSerial('0x403853AB'),
  productsContainerSerial: toSerial('0x403F39FE'),
  batchSize: 3,
  recipes: [
    {
      name: 'Morning Star',
      path: ["executioner's axe", 'mace', 'Morning Star'],
      product: {
        graphic: toGraphic('0x0F5C'),
        color: toGraphic('0x0400'),
      },
      materials: [
        { def: MATERIALS.Silver, req: 10 },
        { def: MATERIALS.Bronze, req: 10 },
      ],
    },
    {
      name: 'Dull Copper Chest (wooman)',
      path: ['Dull copper armor', 'Dull copper chest'],
      product: {
        graphic: toGraphic('0x1C04'),
        color: toGraphic('0x060A'),
      },
      materials: [{ def: MATERIALS.DullCopper, req: 20 }],
    },
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
      name: 'Shadow Chest (wooman)',
      path: ['Shadow armor', 'Shadow chest'],
      product: {
        graphic: toGraphic('0x1C04'),
        color: toGraphic('0x0770'),
      },
      materials: [{ def: MATERIALS.Shadow, req: 20 }],
    },
    {
      name: 'Gold Chest (wooman)',
      path: ['Golden armor', 'Golden chest'],
      product: {
        graphic: toGraphic('0x1C04'),
        color: toGraphic('0x09B5'),
      },
      materials: [{ def: MATERIALS.Gold, req: 20 }],
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
  ],

  startCraftAction: (recipe) => {
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
  },

  // Тренировка скилла во время ожидания крафта
  // onCraftWait() {
  //   const BANDAGE_GRAPHIC = toGraphic('0x0E21');
  //   const BLOODY_BANDAGES_GRAPHIC = toGraphic('0x0E20');
  //   const BANDAGE_CHEST = toSerial('0x403853A7');
  //   const BANDAGE_RESTOCK_COUNT = 10;

  //   // Проверяем бинты в бекпаке
  //   const bandagesInBackpack = Orion.Count(BANDAGE_GRAPHIC, 'any', 'backpack');
  //   if (bandagesInBackpack === 0) {
  //     // Пробуем достать из сундука
  //     var bandagesInChest = Orion.Count(BANDAGE_GRAPHIC, 'any', BANDAGE_CHEST);
  //     if (bandagesInChest === 0) {
  //       return;
  //     }
  //     Orion.MoveItem(
  //       Orion.FindType(BANDAGE_GRAPHIC, 'any', BANDAGE_CHEST)[0],
  //       Math.min(BANDAGE_RESTOCK_COUNT, bandagesInChest),
  //       'backpack',
  //     );
  //     Orion.Wait(ITEM_MOVE_DELAY);
  //     Orion.MoveItem(
  //       Orion.FindType(BLOODY_BANDAGES_GRAPHIC, 'any', 'backpack')[0],
  //       0,
  //       BANDAGE_CHEST,
  //     );
  //     Orion.Wait(ITEM_MOVE_DELAY);
  //   }

  //   Orion.UseSkill('Animal Lore', 'self');
  //   Orion.Wait(2000);
  //   Orion.Say('.bs');
  //   Orion.Wait(3500);
  // },
};

export function Autoload() {
  const crafter = new UniversalCrafter(BlacksmithConfig);
  crafter.run();
}
