import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';

const LEATHER_CONITANER = toSerial('0x403853A7');
const PARCHMENT_CONTAINER = toSerial('0x403853A7');

const Config: CraftConfig = {
  batchSize: 3,
  recipes: [
    {
      name: 'Parchment',
      path: ['misc', 'Parchment'],
      product: {
        def: {
          graphic: toGraphic('0x0E34'),
          color: toGraphic('0x0B7D'),
        },
        container: PARCHMENT_CONTAINER,
      },
      materials: [
        {
          def: { graphic: toGraphic('0x1067'), color: toGraphic('0x0000') },
          req: 1,
          container: LEATHER_CONITANER,
        },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const TOOL_GRAPHIC = toGraphic('0x0F9D');
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
    const materialSerial = Orion.FindType(
      primaryMaterial.graphic,
      primaryMaterial.color,
      'backpack',
    );
    Orion.WaitTargetObject(materialSerial[0]);
    Orion.UseType(TOOL_GRAPHIC);
  },
};

export function Parchment() {
  const crafter = new UniversalCrafter(Config);
  crafter.run();
}

export function Autostart() {
  Orion.Exec('Parchment', true);
}
