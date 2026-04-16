import { moveItem } from '@/lib/helpers';
import { carveCorpse, loot } from '@/lib/loot';
import { tracking } from '@/lib/tracking';
import { toGraphic } from '@/lib/validators';

export function LootPvm() {
  loot(['Treasures', 'Money', 'Reagents', 'Resources', 'Miscellaneous']);
}

export function LootPvp() {
  loot(['Weapons', 'Armors', 'Money']);
}

export function CloseAllMenus() {
  var menusCount = Orion.MenuCount();

  if (menusCount > 0) {
    while (Orion.MenuCount() > 0) {
      Orion.CancelWaitMenu();
      Orion.Wait(50);
      Orion.CloseMenu('all');
    }
  }

  Orion.CancelTarget();
}

export function BandageSelf() {
  Orion.Say('.bs');
  Orion.WarMode(1);
  Orion.WarMode(0);
}

export function ObserveHits() {
  var lastHits = Player.Hits();
  Orion.CharPrint('self', 1159, lastHits);

  while (true) {
    var currentHits = Player.Hits();

    if (currentHits != lastHits && currentHits - 1 !== lastHits) {
      var diff = currentHits - lastHits;

      if (diff > 0) {
        Orion.CharPrint('self', 63, currentHits + ' (+' + diff + ')');
      } else {
        Orion.CharPrint('self', 38, currentHits + ' (' + diff + ')');
      }

      lastHits = currentHits;
    }

    if (Orion.InJournal('barely')) {
      Orion.CharPrint('self', 33, 'Бинт не вошел');
      Orion.ClearJournal();
    }

    Orion.Wait(100);
  }
}

export function TrackingPlayers() {
  tracking('Players');
}

export function TrackingMonsters() {
  tracking('Monsters');
}

export function TrackingAnimals() {
  tracking('Animals');
}

export function Find() {
  findGraphic(toGraphic('0x0000'));
}

export function CutCorpse() {
  carveCorpse();
  LootPvm();
}

export function DrinkInvisibility() {
  Orion.Say('.di');
  Orion.WarMode(0);
}

export function Recall() {
  const runes = Orion.FindType(toGraphic('0x1F14'), '0x0000', 'backpack');

  if (!runes.length) {
    return;
  }

  const rune = runes[0];

  Orion.Cast('Recall', rune);
}

export function PaintAndCutClothes() {
  const CORPSE_GRAPHIC = toGraphic('0x2006');
  const DYING_TUB_GRAPHIC = toGraphic('0x0FAB');
  const SCISSORS_GRAPHIC = toGraphic('0x0F9E');
  const CLOTHS_LIST = 'Clothes';

  const corpses = Orion.FindType(CORPSE_GRAPHIC, 'any', 'ground', 'item', 3);

  const backpackContainer = Orion.GetSerial('backpack');
  const lootedItems: Serial[] = [];

  if (!corpses || corpses.length === 0) {
    Orion.Print('Трупов поблизости не найдено.');
    return;
  }

  for (const corpse of corpses) {
    Orion.OpenContainer(corpse);
    Orion.Wait(100);

    const items = Orion.FindList(CLOTHS_LIST, corpse);

    if (!items || items.length === 0) {
      continue;
    }

    for (const item of items) {
      moveItem(item, 0, 'backpack');
      lootedItems.push(item);
    }
  }

  Orion.Wait(100);

  if (lootedItems.length > 0) {
    for (const item of lootedItems) {
      if (Orion.GetContainer(item) === backpackContainer) {
        Orion.WaitTargetObject(item);
        Orion.UseType(DYING_TUB_GRAPHIC);
        Orion.Wait(100);

        Orion.WaitTargetObject(item);
        Orion.UseType(SCISSORS_GRAPHIC);
        Orion.Wait(100);
      }
    }
  }

  LootPvm();
}

export function FollowTarget() {
  const target = Orion.GetSerial('lasttarget');

  if (!target || target === '0x00000000') {
    Orion.Print('Нет текущей цели!');
    return;
  }

  Orion.Print('Следую за целью...');

  while (true) {
    const obj = Orion.FindObject(target);

    if (!obj) {
      Orion.Print('Цель потеряна!');
      break;
    }

    Orion.WalkTo(obj.X(), obj.Y(), obj.Z(), 1, 255, true, true);
    Orion.Wait(200);
  }
}

export function TargetNext() {
  Orion.WarMode(0);

  function findEnemies() {
    return Orion.FindType(
      'any',
      'any',
      'ground',
      'near|live|ignorefriends',
      15,
      'gray|criminal|orange|red|innocent|blue',
    );
  }

  Orion.Ignore('self');
  let targets = findEnemies();

  // Если целей нет (всех уже перебрали и они в игноре), сбрасываем лист и ищем заново
  if (!targets || targets.length === 0) {
    Orion.IgnoreReset();
    Orion.Ignore('self');
    targets = findEnemies();
  }

  // Если после всех проверок мы кого-то нашли
  if (targets && targets.length > 0) {
    const targetSerial = targets[0];
    const object = Orion.FindObject(targetSerial);

    if (object) {
      Orion.Print(`Цель: ${object.Name()}`);
    }

    // Запоминаем цель и кидаем в игнор для следующего нажатия кнопки
    Orion.AddObject('lasttarget', targetSerial);
    Orion.Ignore(targetSerial); // Добавляем серийник в игнор
  } else {
    Orion.Print('Вокруг никого нет!');
  }
}

export { combatExpUtilization } from '@/lib/exp';

export function ToggleArmorMode() {
  const TOGGLE_ARMOR_BUTTON_INDEX = 20;
  const INFO_TEXT = 'Включена система поглощения повреждений';

  Orion.Say('.ep');

  if (Orion.WaitForGump(1000)) {
    const gump = Orion.GetGump('last');
    if (gump === null || gump.Replayed()) {
      return;
    }

    const gumpHook = Orion.CreateGumpHook(TOGGLE_ARMOR_BUTTON_INDEX);
    if (!gumpHook) {
      return;
    }

    const start = Orion.Now();
    gump.Select(gumpHook);

    const modeMessage = Orion.WaitJournal(
      INFO_TEXT,
      start,
      start + 1000,
      'any',
    );

    if (!modeMessage) {
      return;
    }

    const escapedPhrase = INFO_TEXT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedPhrase + '\\s*(.*?)\\s*\\.');
    const match = modeMessage.Text().match(regex);
    const value = match ? match[1] : null;

    if (!value) {
      return;
    }

    Orion.CharPrint('self', 0x0021, value);
  }
}
