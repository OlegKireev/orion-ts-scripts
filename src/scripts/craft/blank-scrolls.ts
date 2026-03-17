import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  UniversalCrafter,
} from '@/lib/crafting-engine';

const TOOL_GRAPHIC = toGraphic('0x0F9D');

const Config: CraftConfig = {
  resourcesContainerSerial: toSerial('0x403853A7'),
  productsContainerSerial: toSerial('0x403853A7'),
  batchSize: 3,
  recipes: [
    {
      name: 'Blank scroll',
      path: ["Books", 'blank scroll'],
      product: {
        graphic: toGraphic('0x0E34'),
        color: toGraphic('0x0000'),
      },
      materials: [
        { def: { graphic: toGraphic('0x1067'), color: toGraphic('0x0000')}, req: 1 },
        { def: { graphic: toGraphic('0x0E34'), color: toGraphic('0x0B7D')}, req: 1 },
        { def: { graphic: toGraphic('0x0E34'), color: toGraphic('0x0B85')}, req: 1 },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const lether = recipe.materials[0].def;
    const letherSerial = Orion.FindType(lether.graphic, lether.color, 'backpack');
    Orion.WaitTargetObject(letherSerial[0])
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function Autoload() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}
