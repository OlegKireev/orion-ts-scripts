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
      name: 'Parchment',
      path: ["misc", 'Parchment'],
      product: {
        graphic: toGraphic('0x0E34'),
        color: toGraphic('0x0B7D'),
      },
      materials: [
        { def: { graphic: toGraphic('0x1067'), color: toGraphic('0x0000')}, req: 1 },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
    const materialSerial = Orion.FindType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
    Orion.WaitTargetObject(materialSerial[0])
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function Autoload() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}
