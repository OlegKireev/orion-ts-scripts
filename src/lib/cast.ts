import { Item } from '@/constants/items';
import { toGraphic } from './validators';
import { MagicSchool, SpellDef, SPELLS } from '@/constants/spell';

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

export function castSpell(spellName: string, target: Serial) {
  const spellData = schoolsByName[spellName];
  if (!spellData) {
    Orion.Print(`Неизвестное заклинание: ${spellName}`);
    Orion.Cast(spellName, target);
  } else {
    const hatDef = hatBySchool[spellData.school];
    const hats = Orion.FindType(hatDef.graphic, hatDef.color, 'backpack');

    const dressedHeml = Orion.ObjAtLayer('Helmet');

    if (hats.length > 0) {
      Orion.UseObject(hats[0]);
    }

    Orion.Cast(spellName, target);
    Orion.Wait(spellData.duration);

    if (dressedHeml) {
      Orion.UseObject(dressedHeml.Serial());
    }
  }
}
