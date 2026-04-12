import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';

const TOOL_GRAPHIC = toGraphic('0x1034');

const Config: CraftConfig = {
  resourcesContainerSerial: toSerial('0x403853A1'),
  productsContainerSerial: toSerial('0x403853A7'),
  batchSize: 3,
  recipes: [
    {
      name: 'Parchment',
      path: ['Miscellaneous', 'Paper'],
      product: {
        graphic: toGraphic('0x0E34'),
        color: toGraphic('0x0B85'),
      },
      materials: [
        {
          def: { graphic: toGraphic('0x1BDD'), color: toGraphic('0x0000') },
          req: 1,
        },
      ],
    },
  ],

  startCraftAction: () => {
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function Autostart() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}
