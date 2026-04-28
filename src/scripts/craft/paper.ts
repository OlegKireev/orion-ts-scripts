import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';

const LOGS_CONTAINER = toSerial('0x403853A1');
const PAPER_CONTAINER = toSerial('0x403853A7');

const Config: CraftConfig = {
  batchSize: 3,
  recipes: [
    {
      name: 'Paper',
      path: ['Miscellaneous', 'Paper'],
      product: {
        def: {
          graphic: toGraphic('0x0E34'),
          color: toGraphic('0x0B85'),
        },
        container: PAPER_CONTAINER,
      },
      materials: [
        {
          def: { graphic: toGraphic('0x1BDD'), color: toGraphic('0x0000') },
          req: 1,
          container: LOGS_CONTAINER,
        },
      ],
    },
  ],

  startCraftAction: () => {
    const TOOL_GRAPHIC = toGraphic('0x1034');
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function Paper() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}

export function Autostart() {
  Orion.Exec('Paper', true);
}
