import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';
import { INGOTS } from '@/constants/items';

const INGONTS_CONTAINER = toSerial('0x403853AB');
const TRASH_CONTAINER = toSerial('0x403F39FE');

const BlacksmithConfig: CraftConfig = {
  batchSize: 3,
  recipes: [
    {
      name: 'Morning Star',
      path: ["executioner's axe", 'mace', 'Morning Star'],
      product: {
        def: {
          graphic: toGraphic('0x0F5C'),
          color: toGraphic('0x0400'),
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: INGOTS.Silver, req: 10, container: INGONTS_CONTAINER },
        { def: INGOTS.Bronze, req: 10, container: INGONTS_CONTAINER },
      ],
    },
    {
      name: 'Orcish Mace',
      path: ["executioner's axe", 'mace', 'Orcish Mace'],
      product: {
        def: {
          graphic: toGraphic('0x13B3'),
          color: toGraphic('0x0A7E'),
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: INGOTS.Bronze, req: 7, container: INGONTS_CONTAINER },
        { def: INGOTS.Rusty, req: 15, container: INGONTS_CONTAINER },
      ],
    },
    {
      name: 'Dull Copper Chest (wooman)',
      path: ['Dull copper armor', 'Dull copper chest'],
      product: {
        def: {
          graphic: toGraphic('0x1C04'),
          color: toGraphic('0x060A'),
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: INGOTS.DullCopper, req: 20, container: INGONTS_CONTAINER },
      ],
    },
    {
      name: 'War Mace',
      path: ["executioner's axe", 'mace', 'War Mace'],
      product: {
        def: {
          graphic: toGraphic('0x13B3'),
          color: toGraphic('0x0909'),
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: INGOTS.Copper, req: 10, container: INGONTS_CONTAINER },
        { def: INGOTS.OldCopper, req: 10, container: INGONTS_CONTAINER },
      ],
    },
    {
      name: 'Shadow Chest (wooman)',
      path: ['Shadow armor', 'Shadow chest'],
      product: {
        def: {
          graphic: toGraphic('0x1C04'),
          color: toGraphic('0x0770'),
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: INGOTS.Shadow, req: 20, container: INGONTS_CONTAINER },
      ],
    },
    {
      name: 'Blue Steel Chest (wooman)',
      path: ['Blue Steel Armor', 'Blue Steel chest'],
      product: {
        def: {
          graphic: toGraphic('0x1C04'),
          color: toGraphic('0x0128'),
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: INGOTS.Bluesteel, req: 20, container: INGONTS_CONTAINER },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
  },
};

export function Blacksmithing() {
  const crafter = new UniversalCrafter(BlacksmithConfig);
  crafter.run();
}

export function Autostart() {
  Orion.Exec('Blacksmithing', true);
}
