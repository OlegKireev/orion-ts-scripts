import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  type MaterialDef,
  UniversalCrafter,
} from '@/lib/crafting-engine';

const MATERIALS: Record<string, MaterialDef> = {
  MoonStone: { graphic: toGraphic('0x1BEF'), color: '0x0035' },
  Logs: { graphic: toGraphic('0x1BDD'), color: '0x0000' },
  Iron: { graphic: toGraphic('0x1BEF'), color: '0x0000' },
} as const;

const BlacksmithConfig: CraftConfig = {
  resourcesContainerSerial: toSerial('0x403853A1'),
  productsContainerSerial: toSerial('0x40613D1B'),
  batchSize: 2,
  recipes: [
    {
      name: 'Weapon Form',
      path: ['tool kit', 'Weapon Form'],
      product: {
        graphic: toGraphic('0x13A8'),
        color: toGraphic('0x0455'),
      },
      materials: [
        { def: MATERIALS.Iron, req: 100 },
        { def: MATERIALS.MoonStone, req: 10 },
        { def: MATERIALS.Logs, req: 50 },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
  },
};

export function Autostart() {
  const productChest = toSerial('0x403853AB');
  Orion.UseObject(productChest);

  const crafter = new UniversalCrafter(BlacksmithConfig);
  crafter.run();
}
