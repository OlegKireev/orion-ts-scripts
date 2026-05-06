import { Item } from '@/constants/items';
import { toGraphic } from './validators';
import { MagicSchool, SpellDef, SpellName, SPELLS } from '@/constants/spell';

const schoolsByName = SPELLS.reduce<Record<string, SpellDef>>((acc, spell) => {
  acc[spell.name] = spell;
  return acc;
}, {});

const hatBySchool: Record<MagicSchool, Item> = {
  nature: {
    graphic: toGraphic('0x1718'),
    color: '0x0A93',
  },
  fire: {
    graphic: toGraphic('0x1718'),
    color: '0x0A61',
  },
  mind: {
    graphic: toGraphic('0x1718'),
    color: '0x0128',
  },
  dark: {
    graphic: toGraphic('0x1718'),
    color: '0x09EB',
  },
  light: {
    graphic: toGraphic('0x1718'),
    color: '0x09B5',
  },
};

export function castSpell(
  spellName: SpellName,
  target: Serial,
  withHat: boolean = true,
) {
  const MAX_PING = 100;
  const PING_DELAY = MAX_PING + 200;
  const spell = schoolsByName[spellName];

  if (!spell) {
    Orion.Print(`Неизвестное заклинание: ${spellName}`);
    Orion.Cast(spellName, target);
  } else {
    const dressedHeml = Orion.ObjAtLayer('Helmet');

    if (withHat) {
      const hatDef = hatBySchool[spell.school];
      const hats = Orion.FindType(hatDef.graphic, hatDef.color, 'backpack');

      if (hats.length > 0) {
        Orion.UseObject(hats[0]);
      }
    }

    const now = Orion.Now();

    Orion.Cast(spell.name, target);

    if (Orion.WaitJournal(spell.mantra, now, now + PING_DELAY, 'sys|my')) {
      const timerId = spell.name;
      Orion.AddDisplayTimer(
        timerId,
        spell.duration,
        'UnderChar',
        'Line|Bar',
        `${spell.name}...`,
      );

      if (
        Orion.WaitJournal(
          'The spell fizzles.',
          now,
          now + spell.duration + MAX_PING,
          'any',
        )
      ) {
        Orion.RemoveDisplayTimer(timerId);
      }

      // Orion.Wait(spell.duration + MAX_PING);
    }

    if (withHat && dressedHeml) {
      Orion.Wait(MAX_PING);
      Orion.UseObject(dressedHeml.Serial());
    }
  }
}
