import { carveAndLoot, loot } from '@/lib/loot';
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
  carveAndLoot(['Resources', 'Miscellaneous']);
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
      Orion.MoveItem(item, 0, 'backpack');
      Orion.Wait(1);
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
