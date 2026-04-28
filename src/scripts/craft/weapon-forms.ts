import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';
import { INGOTS, LOGS } from '@/constants/items';

const INGOTS_CONTAINER = toSerial('0x403853AB');
const LOGS_CONTAINER = toSerial('0x403853A1');
const WEAPON_FORM_CONTAINER = toSerial('0x40613D1B');

const BlacksmithConfig: CraftConfig = {
  batchSize: 2,
  recipes: [
    {
      name: 'Weapon Form',
      path: ['tool kit', 'Weapon Form'],
      product: {
        def: {
          graphic: toGraphic('0x13A8'),
          color: toGraphic('0x0455'),
        },
        container: WEAPON_FORM_CONTAINER,
      },
      materials: [
        { def: INGOTS.Iron, req: 100, container: INGOTS_CONTAINER },
        { def: INGOTS.MoonStone, req: 10, container: INGOTS_CONTAINER },
        { def: LOGS.Logs, req: 50, container: LOGS_CONTAINER },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const primaryMaterial = recipe.materials[0].def;
    Orion.UseType(primaryMaterial.graphic, primaryMaterial.color, 'backpack');
  },
};

export function WeaponForms() {
  Orion.UseObject(INGOTS_CONTAINER);

  const crafter = new UniversalCrafter(BlacksmithConfig);
  crafter.run();
}

export function Autostart() {
  Orion.Exec('WeaponForms', true);
}
