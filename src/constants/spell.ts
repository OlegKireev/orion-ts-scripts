export type MagicSchool = 'nature' | 'fire' | 'mind' | 'dark' | 'light';

export interface SpellDef {
  circle: number;
  name: string;
  mantra: string;
  school: MagicSchool;
  duration: number;
}

export const SPELLS = [
  // Круг 1
  // { circle: 1, name: 'Clumsy', mantra: 'Uus Jux', school: 'mind' },
  // { circle: 1, name: 'Create Food', mantra: 'In Mani Ylem', school: 'nature' },
  {
    circle: 1,
    name: 'Feeblemind',
    mantra: 'Rel Wis',
    school: 'mind',
    duration: 1000,
  },
  {
    circle: 1,
    name: 'Heal',
    mantra: 'In Mani',
    school: 'light',
    duration: 1000,
  },
  {
    circle: 1,
    name: 'Magic Arrow',
    mantra: 'In Por Ylem',
    school: 'fire',
    duration: 1000,
  },
  // { circle: 1, name: 'Night Sight', mantra: 'In Lor', school: 'mind' },
  // { circle: 1, name: 'Reactive Armor', mantra: 'Flam Sanct', school: 'nature' },
  // { circle: 1, name: 'Weaken', mantra: 'Des Mani', school: 'mind' },
  // Круг 2
  {
    circle: 2,
    name: 'Agility',
    mantra: 'Ex Uus',
    school: 'light',
    duration: 1200,
  },
  {
    circle: 2,
    name: 'Cunning',
    mantra: 'Uus Wis',
    school: 'mind',
    duration: 1200,
  },
  {
    circle: 2,
    name: 'Cure',
    mantra: 'An Nox',
    school: 'nature',
    duration: 1200,
  },
  {
    circle: 2,
    name: 'Harm',
    mantra: 'An Mani',
    school: 'nature',
    duration: 1200,
  },
  // { circle: 2, name: 'Magic Trap', mantra: 'In Jux', school: 'mind' },
  // { circle: 2, name: 'Magic Untrap', mantra: 'An Jux', school: 'mind' },
  {
    circle: 2,
    name: 'Protection',
    mantra: 'Uus Sanct',
    school: 'light',
    duration: 1200,
  },
  {
    circle: 2,
    name: 'Strength',
    mantra: 'Uus Mani',
    school: 'light',
    duration: 1200,
  },
  // Круг 3
  {
    circle: 3,
    name: 'Bless',
    mantra: 'Rel Sanct',
    school: 'light',
    duration: 1700,
  },
  {
    circle: 3,
    name: 'Fireball',
    mantra: 'Vas Flam',
    school: 'fire',
    duration: 1700,
  },
  // { circle: 3, name: 'Magic Lock', mantra: 'An Por', school: 'mind' },
  {
    circle: 3,
    name: 'Poison',
    mantra: 'In Nox',
    school: 'dark',
    duration: 1700,
  },
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
  {
    circle: 4,
    name: 'Curse',
    mantra: 'Des Sanct',
    school: 'dark',
    duration: 2300,
  },
  // { circle: 4, name: 'Fire Field', mantra: 'In Flam Grav', school: 'fire' },
  {
    circle: 4,
    name: 'Greater Heal',
    mantra: 'In Vas Mani',
    school: 'light',
    duration: 2300,
  },
  {
    circle: 4,
    name: 'Lightning',
    mantra: 'Por Ort Grav',
    school: 'nature',
    duration: 2300,
  },
  {
    circle: 4,
    name: 'Mana Drain',
    mantra: 'Ort Rel',
    school: 'mind',
    duration: 2300,
  },
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
  {
    circle: 5,
    name: 'Magic Reflection',
    mantra: 'In Jux Sanct',
    school: 'light',
    duration: 2700,
  },
  {
    circle: 5,
    name: 'Mind Blast',
    mantra: 'Por Corp Wis',
    school: 'mind',
    duration: 2700,
  },
  {
    circle: 5,
    name: 'Paralyze',
    mantra: 'An Ex Por',
    school: 'mind',
    duration: 2700,
  },
  // { circle: 5, name: 'Poison Field', mantra: 'In Nox Grav', school: 'nature' },
  // { circle: 5, name: 'Summon Creature', mantra: 'Kal Xen', school: 'dark' },
  // Круг 6
  {
    circle: 6,
    name: 'Dispel',
    mantra: 'An Ort',
    school: 'mind',
    duration: 3500,
  },
  {
    circle: 6,
    name: 'Energy Bolt',
    mantra: 'Corp Por',
    school: 'nature',
    duration: 3500,
  },
  {
    circle: 6,
    name: 'Explosion',
    mantra: 'Vas Ort Flam',
    school: 'fire',
    duration: 3500,
  },
  // { circle: 6, name: 'Invisibility', mantra: 'An Lor Xen', school: 'mind' },
  // { circle: 6, name: 'Mark', mantra: 'Kal Por Ylem', school: 'mind' },
  {
    circle: 6,
    name: 'Mass Curse',
    mantra: 'Vas Des Sanct',
    school: 'dark',
    duration: 3500,
  },
  // { circle: 6, name: 'Paralyze Field', mantra: 'In Ex Grav', school: 'mind' },
  // { circle: 6, name: 'Reveal', mantra: 'Wis Quas', school: 'mind' },
  // Круг 7
  {
    circle: 7,
    name: 'Chain Lightning',
    mantra: 'Vas Ort Grav',
    school: 'nature',
    duration: 4000,
  },
  // { circle: 7, name: 'Energy Field', mantra: 'In Sanct Grav', school: 'dark' },
  {
    circle: 7,
    name: 'Flame Strike',
    mantra: 'Kal Vas Flam',
    school: 'fire',
    duration: 4000,
  },
  // { circle: 7, name: 'Gate Travel', mantra: 'Vas Rel Por', school: 'mind' },
  // { circle: 7, name: 'Mana Vampire', mantra: 'Ort Sanct', school: 'mind' },
  // { circle: 7, name: 'Mass Dispel', mantra: 'Vas An Ort', school: 'mind' },
  {
    circle: 7,
    name: 'Meteor Swarm',
    mantra: 'Flam Kal Des Ylem',
    school: 'fire',
    duration: 4000,
  },
  // { circle: 7, name: 'Polymorph', mantra: 'Vas Ylem Rel', school: 'mind' },
  // Круг 8
  {
    circle: 8,
    name: 'Earthquake',
    mantra: 'In Vas Por',
    school: 'nature',
    duration: 4500,
  },
  {
    circle: 8,
    name: 'Energy Vortex',
    mantra: 'Vas Corp Por',
    school: 'nature',
    duration: 4500,
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
] as const satisfies SpellDef[];

export type SpellName = (typeof SPELLS)[number]['name'];
