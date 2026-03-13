import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  type MaterialDef,
  UniversalCrafter,
} from '@/lib/crafting-engine';

const MATERIALS: Record<string, MaterialDef> = {
  Rusty: { graphic: toGraphic('0x1BEF'), color: '0x09EB' },
  OldCopper: { graphic: toGraphic('0x1BEF'), color: '0x09E8' },
  Bronze: { graphic: toGraphic('0x1BEF'), color: '0x06D6' },
  Copper: { graphic: toGraphic('0x1BE3'), color: '0x0000' },
  Steel: { graphic: toGraphic('0x1BEF'), color: '0x09F1' },
  Silver: { graphic: toGraphic('0x1BF5'), color: '0x0000' },
};

const BlacksmithConfig: CraftConfig = {
  resourcesContainerSerial: toSerial('0x403853AB'),
  productsContainerSerial: toSerial('0x40215610'),
  batchSize: 3,
  recipes: [
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
  ],

  startCraftAction: (recipe) => {
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
  },
};

export function Autoload() {
  const crafter = new UniversalCrafter(BlacksmithConfig);
  crafter.run();
}
