import { toGraphic } from './validators';

export function combatExpUtilization() {
  const WITH_THRESHOLDS = false; // Использовать лимиты по сливу экспы или нет

  const SKILL_MAP = {
    Wrestling: 1,
    Fencing: 2,
    Swordsmanship: 3,
    'Mace Fighting': 4,
    Archery: 5,
    Tactics: 6,
    Parrying: 7,
  } as const;

  // Лимиты по сливу экспы, например чтобы не качать Мейсу до упора без тактики, например
  const SKILL_TRESHOLDS: Record<number, { name: SkillName; limit: number }> = {
    [SKILL_MAP.Wrestling]: { name: 'Wrestling', limit: 80 },
    [SKILL_MAP.Fencing]: { name: 'Fencing', limit: 80 },
    [SKILL_MAP.Swordsmanship]: { name: 'Swordsmanship', limit: 80 },
    [SKILL_MAP['Mace Fighting']]: { name: 'Mace Fighting', limit: 80 },
    [SKILL_MAP.Archery]: { name: 'Archery', limit: 80 },
    [SKILL_MAP.Tactics]: { name: 'Tactics', limit: 80 },
    [SKILL_MAP.Parrying]: { name: 'Parrying', limit: 80 },
  };

  var PRIMARY_SKILL_BUTTONS = [
    SKILL_MAP.Wrestling,
    SKILL_MAP.Fencing,
    SKILL_MAP.Swordsmanship,
    SKILL_MAP['Mace Fighting'],
    SKILL_MAP.Archery,
  ];

  var SECONDARY_SKILL_BUTTONS = [SKILL_MAP.Tactics, SKILL_MAP.Parrying];

  var TRANSFER_EXP_BUTTONS = [
    11, // Wrestling
    12, // Fencing
    13, // Swordsmanship
    14, // Mace Fighting
    15, // Archery
  ];

  var LEVELING_EXP_BUTTONS = [
    16, // Wrestling
    17, // Fencing
    18, // Swordsmanship
    19, // Mace Fighting
    20, // Archery
  ];

  const PILLAR_EXP_DEF = {
    graphic: toGraphic('0x0167'),
    color: '0x0A7B',
  } as const;

  if (
    Orion.FindType(
      PILLAR_EXP_DEF.graphic,
      PILLAR_EXP_DEF.color,
      'ground',
      '',
      'usedistance',
    ).length == 0
  ) {
    Orion.Print('Too far away');
    Orion.Terminate('all');
  }

  PRIMARY_SKILL_BUTTONS.forEach(function (__button) {
    _expUtilization(__button);
  });

  if (_expUtilization(6) == 1 || _expUtilization(7) == 1) {
    TRANSFER_EXP_BUTTONS.forEach(function (__button) {
      _expUtilization(__button);
    });
  }

  SECONDARY_SKILL_BUTTONS.forEach(function (__button) {
    _expUtilization(__button);
  });

  if (Player.Str() + Player.Dex() + Player.Int() > 399) {
    LEVELING_EXP_BUTTONS.forEach(function (__button) {
      _expUtilization(__button);
    });
  }

  function _expUtilization(buttonNumber: number) {
    var expExists = true;
    while (expExists) {
      if (WITH_THRESHOLDS && buttonNumber in SKILL_TRESHOLDS) {
        const { limit, name } = SKILL_TRESHOLDS[buttonNumber];

        if (limit * 10 <= Orion.SkillValue(name)) {
          Orion.Print(
            `Пропускаю скилл ${name}, текущее значение ${Orion.SkillValue(SKILL_TRESHOLDS[buttonNumber].name)} превышает максимальное ${limit}`,
          );
          return;
        }
      }

      Orion.Print(buttonNumber);
      Orion.CloseGump('generic');
      Orion.UseFromGround(PILLAR_EXP_DEF.graphic, PILLAR_EXP_DEF.color);

      if (Orion.WaitForGump(1000)) {
        const gump = Orion.GetGump('last');
        if (gump !== null && !gump.Replayed()) {
          const gumpHook = Orion.CreateGumpHook(buttonNumber);
          if (gumpHook) {
            gump.Select(gumpHook);
          }
        }
      }

      const result = Orion.WaitJournal(
        'You transfer|Too few|while being|can not|increased|Cancelled|Unexpected',
        Orion.Now(),
        Orion.Now() + 500,
        'sys|my',
      );

      if (result && result.FindTextID() == 1) {
        expExists = false;
        return 1;
      }

      if (result && (result.FindTextID() == 2 || result.FindTextID() == 3)) {
        expExists = false;
        return 0;
      }

      if (result && (result.FindTextID() == 5 || result.FindTextID() == 6)) {
        Orion.Wait(200);
        if (Orion.GetGump('last') !== null) {
          Orion.CloseGump('generic');
        }
      }
    }
  }
}
