import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';

const IRON_WIRE_CONTAINER = toSerial('0x403853A4');
const INGOTS_CONTAINER = toSerial('0x403853AB');

const Config: CraftConfig = {
  batchSize: 3,
  recipes: [
    {
      name: 'Iron wire',
      path: ['Parts', 'iron wire'],
      product: {
        def: {
          graphic: toGraphic('0x1876'),
          color: toGraphic('0x0000'),
        },
        container: IRON_WIRE_CONTAINER,
      },
      materials: [
        {
          def: { graphic: toGraphic('0x1BEF'), color: toGraphic('0x0000') },
          req: 1,
          container: INGOTS_CONTAINER,
        },
      ],
    },
  ],

  startCraftAction: () => {
    const TOOL_GRAPHIC = toGraphic('0x1EBC');
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function IronWire() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}

export function Autostart() {
  Orion.Exec('IronWire', true);
}
