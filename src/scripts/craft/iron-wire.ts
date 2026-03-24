import { toGraphic, toSerial } from '@lib/validators';
import {
  CraftConfig,
  UniversalCrafter,
} from '@/lib/crafting-engine';

const TOOL_GRAPHIC = toGraphic('0x1EBC');

const Config: CraftConfig = {
  resourcesContainerSerial: toSerial('0x403853AB'),
  productsContainerSerial: toSerial('0x403853A4'),
  batchSize: 3,
  recipes: [
    {
      name: 'Iron wire',
      path: ["Parts", 'iron wire'],
      product: {
        graphic: toGraphic('0x1876'),
        color: toGraphic('0x0000'),
      },
      materials: [
        { def: { graphic: toGraphic('0x1BEF'), color: toGraphic('0x0000')}, req: 1 },
      ],
    },
  ],

  startCraftAction: () => {
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function Autoload() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}
