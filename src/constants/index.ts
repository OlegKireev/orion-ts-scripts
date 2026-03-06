export const GLOBAL_SERIALS = [
  'any', // любой объект
  'self', // серийник персонажа
  'backpack', // сумка персонажа
  'ground', // земля
  'lastcorpse', // последний труп появившийся на экране
  'lasttarget', // последняя выбранная цель
  'harmtarget', // последняя выбранная вражеская цель
  'helptarget', // последняя выбранная дружеская цель
  'lasttile', // последняя выбранный тайл в мире
  'lastattack', // последняя атакованная цель
  'laststatus', // последний персонаж, с которого стянули статус
  'lastcontainer', // последний открытый контейнер
  'lastobject', // последний использованный объект
  'dressbag', // сумка для переодевания (куда складывать одежду)
  'catchbag', // контейнер для перехвата предметов, попадающих в backpack (например при крафте)
  'newtargetsystem', // серийник объекта новой таргет системы'
] as const;
export const GLOBAL_GRAPHICS = ['any'] as const;

export const SKILLS = [
  'Alchemy',
  'Anatomy',
  'Animal Lore',
  'Item Identification',
  'Arms Lore',
  'Parrying',
  'Begging',
  'Blacksmithing',
  'Bowcraft',
  'Peacemaking',
  'Camping',
  'Carpentry',
  'Cartography',
  'Cooking',
  'Detecting Hidden',
  'Enticement',
  'Evaluating Intelligence',
  'Healing',
  'Fishing',
  'Forensic Evaluation',
  'Herding',
  'Hiding',
  'Provocation',
  'Inscription',
  'Lockpicking',
  'Magery',
  'Magic Resistance',
  'Tactics',
  'Snooping',
  'Musicianship',
  'Poisoning',
  'Archery',
  'Spirit Speak',
  'Stealing',
  'Tailoring',
  'Animal Taming',
  'Taste Identification',
  'Tinkering',
  'Tracking',
  'Veterinary',
  'Swordsmanship',
  'Mace Fighting',
  'Fencing',
  'Wrestling',
  'Lumberjacking',
  'Mining',
  'Meditation',
  'Stealth',
  'Remove Trap',
] as const;
