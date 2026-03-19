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
              Orion.CharPrint('self', 63, currentHits + " (+" + diff + ")");
          } else {
              Orion.CharPrint('self', 38, currentHits + " (" + diff + ")");
          }

          lastHits = currentHits;
      }

      if (Orion.InJournal('barely')) {
          Orion.CharPrint('self', 33, "Бинт не вошел");
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
