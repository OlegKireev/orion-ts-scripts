/**
 * Spell Watcher — отслеживает мантры кастов в журнале и надевает резист-шкуру
 * соответствующей школы магии.
 */

import { checkLag } from '@lib/helpers';
import { toGraphic } from '@lib/validators';

type School = 'nature' | 'fire' | 'mind' | 'dark' | 'light';

interface SpellDef {
  circle: number;
  name: string;
  mantra: string;
  school: School;
}

interface ItemDef {
  graphic: Graphic;
  color: string;
}

interface WatcherState {
  currentSchool: School | null;
  currentSkinSerial: Serial | null;
}

const SCRIPT_NAME = 'SpellWatcher';

// ============================================================================
// КОНСТАНТЫ (КОНФИГУРАЦИЯ)
// ============================================================================

/** Максимальное время блокировки WaitJournal за один тик (мс). */
const JOURNAL_WAIT_TIMEOUT_MS = 800;

/** Микропауза между тиками главного цикла (мс). */
const LOOP_TICK_MS = 50;

/** Цвет каста в журнале */
const MANTRA_MESSAGE_COLOR = '0x03B2';

/** Шкуры по школам магии.*/
const SCHOOL_SKINS: Record<School, ItemDef> = {
  nature: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0A93' },
  fire: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0A61' },
  mind: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0BA2' },
  dark: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0B73' },
  light: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0001' },
};

const SPELL_DATA: SpellDef[] = [
  // Круг 1
  // { circle: 1, name: 'Clumsy', mantra: 'Uus Jux', school: 'mind' },
  // { circle: 1, name: 'Create Food', mantra: 'In Mani Ylem', school: 'nature' },
  { circle: 1, name: 'Feeblemind', mantra: 'Rel Wis', school: 'mind' },
  // { circle: 1, name: 'Heal', mantra: 'In Mani', school: 'light' },
  // { circle: 1, name: 'Magic Arrow', mantra: 'In Por Ylem', school: 'fire' },
  // { circle: 1, name: 'Night Sight', mantra: 'In Lor', school: 'mind' },
  // { circle: 1, name: 'Reactive Armor', mantra: 'Flam Sanct', school: 'nature' },
  // { circle: 1, name: 'Weaken', mantra: 'Des Mani', school: 'mind' },
  // Круг 2
  // { circle: 2, name: 'Agility', mantra: 'Ex Uus', school: 'mind' },
  // { circle: 2, name: 'Cunning', mantra: 'Uus Wis', school: 'mind' },
  // { circle: 2, name: 'Cure', mantra: 'An Nox', school: 'nature' },
  { circle: 2, name: 'Harm', mantra: 'An Mani', school: 'nature' },
  // { circle: 2, name: 'Magic Trap', mantra: 'In Jux', school: 'mind' },
  // { circle: 2, name: 'Magic Untrap', mantra: 'An Jux', school: 'mind' },
  // { circle: 2, name: 'Protection', mantra: 'Uus Sanct', school: 'nature' },
  // { circle: 2, name: 'Strength', mantra: 'Uus Mani', school: 'nature' },
  // Круг 3
  // { circle: 3, name: 'Bless', mantra: 'Rel Sanct', school: 'nature' },
  { circle: 3, name: 'Fireball', mantra: 'Vas Flam', school: 'fire' },
  // { circle: 3, name: 'Magic Lock', mantra: 'An Por', school: 'mind' },
  { circle: 3, name: 'Poison', mantra: 'In Nox', school: 'dark' },
  // { circle: 3, name: 'Telekinesis', mantra: 'Ort Por Ylem', school: 'mind' },
  // { circle: 3, name: 'Teleport', mantra: 'Rel Por', school: 'mind' },
  // { circle: 3, name: 'Unlock', mantra: 'Ex Por', school: 'mind' },
  // {
  //   circle: 3,
  //   name: 'Wall of Stone',
  //   mantra: 'In Sanct Ylem',
  //   school: 'nature',
  // },
  // Круг 4
  // { circle: 4, name: 'Arch Cure', mantra: 'Vas An Nox', school: 'nature' },
  // {
  //   circle: 4,
  //   name: 'Arch Protection',
  //   mantra: 'Vas Uus Sanct',
  //   school: 'nature',
  // },
  { circle: 4, name: 'Curse', mantra: 'Des Sanct', school: 'dark' },
  // { circle: 4, name: 'Fire Field', mantra: 'In Flam Grav', school: 'fire' },
  // { circle: 4, name: 'Greater Heal', mantra: 'In Vas Mani', school: 'nature' },
  { circle: 4, name: 'Lightning', mantra: 'Por Ort Grav', school: 'nature' },
  { circle: 4, name: 'Mana Drain', mantra: 'Ort Rel', school: 'mind' },
  // { circle: 4, name: 'Recall', mantra: 'Kal Ort Por', school: 'mind' },
  // Круг 5
  // {
  //   circle: 5,
  //   name: 'Blade Spirits',
  //   mantra: 'In Jux Hur Ylem',
  //   school: 'dark',
  // },
  // { circle: 5, name: 'Dispel Field', mantra: 'An Grav', school: 'mind' },
  // { circle: 5, name: 'Incognito', mantra: 'Kal In Ex', school: 'mind' },
  // {
  //   circle: 5,
  //   name: 'Magic Reflection',
  //   mantra: 'In Jux Sanct',
  //   school: 'mind',
  // },
  { circle: 5, name: 'Mind Blast', mantra: 'Por Corp Wis', school: 'mind' },
  { circle: 5, name: 'Paralyze', mantra: 'An Ex Por', school: 'mind' },
  // { circle: 5, name: 'Poison Field', mantra: 'In Nox Grav', school: 'nature' },
  // { circle: 5, name: 'Summon Creature', mantra: 'Kal Xen', school: 'dark' },
  // Круг 6
  // { circle: 6, name: 'Dispel', mantra: 'An Ort', school: 'mind' },
  { circle: 6, name: 'Energy Bolt', mantra: 'Corp Por', school: 'nature' },
  { circle: 6, name: 'Explosion', mantra: 'Vas Ort Flam', school: 'fire' },
  // { circle: 6, name: 'Invisibility', mantra: 'An Lor Xen', school: 'mind' },
  // { circle: 6, name: 'Mark', mantra: 'Kal Por Ylem', school: 'mind' },
  { circle: 6, name: 'Mass Curse', mantra: 'Vas Des Sanct', school: 'dark' },
  // { circle: 6, name: 'Paralyze Field', mantra: 'In Ex Grav', school: 'mind' },
  // { circle: 6, name: 'Reveal', mantra: 'Wis Quas', school: 'mind' },
  // Круг 7
  {
    circle: 7,
    name: 'Chain Lightning',
    mantra: 'Vas Ort Grav',
    school: 'nature',
  },
  // { circle: 7, name: 'Energy Field', mantra: 'In Sanct Grav', school: 'dark' },
  { circle: 7, name: 'Flame Strike', mantra: 'Kal Vas Flam', school: 'fire' },
  // { circle: 7, name: 'Gate Travel', mantra: 'Vas Rel Por', school: 'mind' },
  // { circle: 7, name: 'Mana Vampire', mantra: 'Ort Sanct', school: 'mind' },
  // { circle: 7, name: 'Mass Dispel', mantra: 'Vas An Ort', school: 'mind' },
  {
    circle: 7,
    name: 'Meteor Swarm',
    mantra: 'Flam Kal Des Ylem',
    school: 'fire',
  },
  // { circle: 7, name: 'Polymorph', mantra: 'Vas Ylem Rel', school: 'mind' },
  // Круг 8
  { circle: 8, name: 'Earthquake', mantra: 'In Vas Por', school: 'nature' },
  {
    circle: 8,
    name: 'Energy Vortex',
    mantra: 'Vas Corp Por',
    school: 'nature',
  },
  // { circle: 8, name: 'Resurrection', mantra: 'An Corp', school: 'nature' },
  // {
  //   circle: 8,
  //   name: 'Summon Air Elemental',
  //   mantra: 'Kal Vas Xen Hur',
  //   school: 'dark',
  // },
  // {
  //   circle: 8,
  //   name: 'Summon Daemon',
  //   mantra: 'Kal Vas Xen Corp',
  //   school: 'dark',
  // },
  // {
  //   circle: 8,
  //   name: 'Summon Earth Elemental',
  //   mantra: 'Kal Vas Xen Ylem',
  //   school: 'dark',
  // },
  // {
  //   circle: 8,
  //   name: 'Summon Fire Elemental',
  //   mantra: 'Kal Vas Xen Flam',
  //   school: 'dark',
  // },
  // {
  //   circle: 8,
  //   name: 'Summon Water Elemental',
  //   mantra: 'Kal Vas Xen An Flam',
  //   school: 'dark',
  // },
];

// Паттерн для Orion.WaitJournal — все мантры через "|".
const MANTRA_PATTERN = SPELL_DATA.map((s) => s.mantra).join('|');

// Спеллы, отсортированные по длине мантры DESC — защита от префиксных коллизий
// (напр. "An Ort" vs "Vas An Ort"): длинная совпадёт первой.
const SPELL_DATA_BY_LEN = SPELL_DATA.slice().sort(
  (a, b) => b.mantra.length - a.mantra.length,
);

// ============================================================================
// ФУНКЦИИ
// ============================================================================

/** Резолвит школу магии из текста журнальной строки (устойчиво к коллизиям). */
function resolveSchoolFromMessage(text: string): SpellDef | null {
  for (const spell of SPELL_DATA_BY_LEN) {
    if (text.indexOf(spell.mantra) !== -1) {
      return spell;
    }
  }
  return null;
}

/** Проверяет, надета ли указанная шкура */
function isSkinEquipped(serial: Serial | null): boolean {
  if (!serial) return false;
  const obj = Orion.FindObject(serial);
  if (!obj) return false;
  return obj.Container() === Player.Serial();
}

/** Надевает шкуру нужной школы из рюкзака. */
function equipSkin(school: School, state: WatcherState): void {
  // Уже надета нужная шкура — ничего не делаем.
  if (
    state.currentSchool === school &&
    isSkinEquipped(state.currentSkinSerial)
  ) {
    return;
  }

  const skin = SCHOOL_SKINS[school];
  const foundSkins = Orion.FindType(
    skin.graphic,
    skin.color,
    'backpack',
    '',
    '',
    '',
    true,
  );

  if (!foundSkins || foundSkins.length === 0) {
    Orion.Print(`[${SpellWatcher}] Шкура школы ${school} не найдена в рюкзаке`);
    return;
  }

  const serial = foundSkins[0];

  for (const skin of foundSkins) {
    Orion.UseObject(skin);
  }

  state.currentSchool = school;
  state.currentSkinSerial = serial;
}

// ============================================================================
// ТОЧКИ ВХОДА
// ============================================================================

export function SpellWatcher(): void {
  Orion.Print(`[${SCRIPT_NAME}] Запуск отслеживания вражеских кастов`);

  const state: WatcherState = {
    currentSchool: null,
    currentSkinSerial: null,
  };

  Orion.ClearJournal();
  let lastCheck = Orion.Now();

  while (!Player.Dead()) {
    const now = Orion.Now();
    const msg = Orion.WaitJournal(
      MANTRA_PATTERN,
      lastCheck,
      now + JOURNAL_WAIT_TIMEOUT_MS,
      'ignoreself|ignorefriends',
      '0',
      MANTRA_MESSAGE_COLOR,
    );

    if (msg) {
      lastCheck = now + JOURNAL_WAIT_TIMEOUT_MS;
      const spell = resolveSchoolFromMessage(msg.Text());
      if (!spell) {
        continue;
      }

      equipSkin(spell.school, state);
      Orion.Print(
        `[${SCRIPT_NAME}] ${spell.school}: ${spell.mantra} (${spell.name}) → шкура надета`,
      );
    } else {
      lastCheck = now;
    }

    checkLag();
    Orion.Wait(LOOP_TICK_MS);
  }

  Orion.Print(`[${SCRIPT_NAME}] Остановлен`);
}

export function StopSpellWatcher(): void {
  Orion.Terminate('SpellWatcher');
  Orion.Print(`[${SCRIPT_NAME}] Завершение по запросу`);
}
