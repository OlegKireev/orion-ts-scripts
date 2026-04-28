import { toGraphic, toSerial } from '@lib/validators';
import { CraftConfig, UniversalCrafter } from '@/lib/crafting-engine';
import { REAGENTS } from '@/constants/items';

const POTIONS_CONTAINER = toSerial('0x4038539A');
const REAGENTS_CONTAINER = toSerial('0x4038539F');
const EMPTY_BOTTLE_CONTAINER = toSerial('0x40385397');
const TRASH_CONTAINER = toSerial('0x403F39FE');

const EMPTY_BOTTLE_DEFINITION = {
  graphic: toGraphic('0x0F0E'),
  color: '0x0000',
};

const AlchemyConfig: CraftConfig = {
  batchSize: 3,
  recipes: [
    {
      name: 'Heal',
      path: ['Healing Potions', '1'],
      product: {
        def: {
          graphic: toGraphic('0x0F0C'),
          color: '0x0000',
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: REAGENTS.Ginseng, req: 2, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
    {
      name: 'Greater Agility',
      path: ['Agility Potions', 'Greater Agility'],
      product: {
        def: {
          graphic: toGraphic('0x0F08'),
          color: '0x0000',
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: REAGENTS.BloodMoss, req: 3, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
    {
      name: 'Explosion',
      path: ['Explosion Potions', '1'],
      product: {
        def: {
          graphic: toGraphic('0x0F0D'),
          color: '0x0000',
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: REAGENTS.SulfurousAsh, req: 4, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
    {
      name: 'Strength',
      path: ['Strength Potions', '0'],
      product: {
        def: {
          graphic: toGraphic('0x0F09'),
          color: '0x0000',
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: REAGENTS.MandrakeRoot, req: 2, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
    {
      name: 'Total Refresh',
      path: ['Refresh Potions', 'Total Refresh'],
      product: {
        def: {
          graphic: toGraphic('0x0F0B'),
          color: '0x0000',
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: REAGENTS.BlackPearl, req: 5, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
    {
      name: 'Greater Poison',
      path: ['Poison Potions', 'Greater Poison'],
      product: {
        def: {
          graphic: toGraphic('0x0F0A'),
          color: '0x0000',
        },
        container: POTIONS_CONTAINER,
      },
      materials: [
        { def: REAGENTS.Nightshade, req: 3, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
    {
      name: 'Greater Cure',
      path: ['Cure Potions', 'Greater Cure'],
      product: {
        def: {
          graphic: toGraphic('0x0F07'),
          color: '0x0000',
        },
        container: TRASH_CONTAINER,
      },
      materials: [
        { def: REAGENTS.Garlic, req: 3, container: REAGENTS_CONTAINER },
        {
          def: EMPTY_BOTTLE_DEFINITION,
          req: 1,
          container: EMPTY_BOTTLE_CONTAINER,
        },
      ],
    },
  ],

  startCraftAction: (recipe) => {
    const TOOL_GRAPHIC = toGraphic('0x0E9B');
    const mortars = Orion.FindType(TOOL_GRAPHIC, 'any', 'backpack');

    if (!mortars.length) {
      Orion.Print('В бекпаке не найдена ступка');
      return;
    }

    const reagent = recipe.materials[0].def;
    const reagentSerial = Orion.FindType(
      reagent.graphic,
      reagent.color,
      'backpack',
    )[0];

    if (!reagentSerial) {
      Orion.Print('В бекпаке не найден реагент из рецепта');
      return;
    }

    Orion.WaitTargetObject(reagentSerial);
    Orion.UseType(TOOL_GRAPHIC, 'any', 'backpack');
  },
};

export function Alchemy() {
  const crafter = new UniversalCrafter(AlchemyConfig);
  crafter.run();
}

export function Autostart() {
  Orion.Exec('Alchemy', true);
}
