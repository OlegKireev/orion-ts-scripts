import { LOOT_DELAY } from '@/constants';
import { toGraphic } from './validators';
import { REAGENTS } from '@/constants/items';

const LAG_DELAY = 60000;

export function checkLag(): void {
  const start = Orion.Now();
  Orion.Click('backpack');
  Orion.WaitJournal('', start, start + LAG_DELAY, 'any');
  Orion.Wait(1);
}

export function stopBot(exclusion: string = ''): void {
  if (Orion.IsWalking()) {
    Orion.StopWalking();
  }

  Orion.StopMacro();
  Orion.BlockMoving(false);
  Orion.OptionAlwaysRun(false);
  Orion.ResetIgnoreList();
  Orion.CancelWaitGump();
  Orion.CancelWaitMenu();
  Orion.CancelWaitTarget();
  Orion.ClearTimers();
  Orion.Terminate('all', exclusion);
}

/** Обертка для перемещения предмета с задержкой и ретраем */
export function moveItem(
  serial: Serial,
  count: number,
  container: Serial,
  x?: number,
  y?: number,
  z?: number,
): void {
  const start = Orion.Now();
  const end = start + LOOT_DELAY;
  Orion.MoveItem(serial, count, container, x, y, z);
  Orion.Wait(LOOT_DELAY);

  if (Orion.InJournal('Slow down', 'sys', 0, 'any', start, end)) {
    Orion.MoveItem(serial, count, container, x, y, z);
    Orion.Wait(LOOT_DELAY);
  }
}

export function OpenNestedBags(container?: Serial) {
  const CONTAINER_GRAPHICS = toGraphic('0x0E7D|0x09AA|0x0E75|0x0E76|0x09B0'); //сумки

  const rootContainer = container || Orion.GetSerial('backpack');

  const queue: Serial[] = [rootContainer];
  const openedBags: Record<string, boolean> = {};
  openedBags[rootContainer] = true;

  let totalOpened = 0;

  while (queue.length > 0) {
    const currentContainer = queue.shift();
    if (!currentContainer) {
      continue;
    }

    Orion.OpenContainer(currentContainer);
    Orion.Wait(10);
    totalOpened += 1;

    const foundBags = Orion.FindType(
      CONTAINER_GRAPHICS,
      'any',
      currentContainer,
    );

    if (foundBags && foundBags.length > 0) {
      for (let i = 0; i < foundBags.length; i++) {
        const bag = foundBags[i];

        if (!openedBags[bag]) {
          openedBags[bag] = true;
          queue.push(bag);
        }
      }
    }
  }

  Orion.Print('Все сумки открыты');
}

export function getPlayerRace() {
  const RACE_MAP: Record<string, string> = {
    'светлый эльф': 'Elf',
    орк: 'Orc',
    'тёмный эльф': 'Drow',
    гном: 'Dwarf',
    имперец: 'Imperian',
  };

  const rawRace = Player.FullName();
  const processedRace = rawRace.replace(/"/g, '').toLowerCase();

  return RACE_MAP[processedRace];
}

export function teleportLogout() {
  if (Orion.SkillValue('Magery') < 300) {
    Orion.Print('Для телепорта недостаточно magery!');
    return;
  }

  const bloodMoss = Orion.FindType(
    REAGENTS.BloodMoss.graphic,
    REAGENTS.BloodMoss.color,
    'backpack',
  );
  const mandrakeRoot = Orion.FindType(
    REAGENTS.MandrakeRoot.graphic,
    REAGENTS.MandrakeRoot.color,
    'backpack',
  );

  if (bloodMoss.length < 1 || mandrakeRoot.length < 1) {
    Orion.Print('Для телепорта недостаточно реагентов!');
    return;
  }

  if (Orion.SkillValue('Magery') < 300) {
    Orion.Print('Для телепорта недостаточно magery!');
    return;
  }

  Orion.Cast('Teleport', 'self');
  Orion.Wait(100);
  Orion.LogOut();
}
