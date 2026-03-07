import { checkLag, stopBot } from './helpers';
import { toGraphic } from './validators';

export interface DropItem {
  type: Graphic;
  color: Graphic;
}

export interface RestockItem {
  name: string;
  type: Graphic;
  color: Graphic;
  max: number;
  min: number;
  box: Serial;
  x: number;
  y: number;
}

const MOVE_DELAY = 100;

export function openContainer(
  serial: Serial,
  recursive: boolean = false,
): void {
  const types = toGraphic('0x09B0|0x0E76|0x0E75|0x09AA');
  let wait = false;

  if (serial !== 'self' && !Orion.GumpExists('container', serial)) {
    wait = true;
    checkLag();
    const start = Orion.Now();
    Orion.UseObject(serial);

    while (
      !Orion.GumpExists('container', serial) &&
      Orion.Now() < start + 1000
    ) {
      Orion.Wait(100);
    }
  }

  if (recursive) {
    let lastCount = 0;
    while (true) {
      const containers = Orion.FindType(types, 'any', serial, '', 0, '', true);
      if (containers.length <= lastCount) break;

      lastCount += containers.length;

      for (const container of containers) {
        while (!Orion.GumpExists('container', container)) {
          wait = true;
          checkLag();
          const start = Orion.Now();
          Orion.UseObject(container);

          while (
            !Orion.GumpExists('container', container) &&
            Orion.Now() < start + 1000
          ) {
            Orion.Wait(100);
          }
        }
      }
    }
  }

  if (wait) Orion.Wait(100);
}

export function dropItems(
  items: DropItem[],
  grabFrom: Serial,
  dropTo: Serial,
): void {
  openContainer(grabFrom);

  for (const item of items) {
    const foundItems = Orion.FindType(item.type, item.color, grabFrom);

    for (const foundItem of foundItems) {
      checkLag();
      Orion.MoveItem(foundItem, 0, dropTo);
      Orion.Wait(MOVE_DELAY);
    }
  }
}

export function restockItems(
  items: RestockItem[],
  grabFrom: Serial,
  dropTo: Serial,
): void {
  const heavyMsg =
    'Too many items in that container|Too many items here|The ground collapses|That is too heavy|It appears to be locked';

  for (const item of items) {
    const targetDrop = item.box === 'self' ? dropTo : item.box;

    openContainer(targetDrop);
    let amount = Orion.Count(item.type, item.color, targetDrop);

    if (amount >= item.max) continue;
    amount = item.max - amount;

    openContainer(grabFrom, true);

    let msg: any = null;
    do {
      const backpackSerial = Orion.GetSerial('backpack');
      const skipRecursive =
        grabFrom === backpackSerial ||
        Orion.GetContainer(targetDrop) === grabFrom;
      const newItems = Orion.FindType(
        item.type,
        item.color,
        grabFrom,
        '',
        0,
        '',
        !skipRecursive,
      );

      if (!newItems.length) break;

      checkLag();
      const count = Orion.Count(item.type, item.color, targetDrop);
      const start = Orion.Now();

      Orion.MoveItem(
        newItems[0],
        amount,
        targetDrop,
        count === 0 ? item.x : -1,
        count === 0 ? item.y : -1,
        0,
      );

      msg = Orion.WaitJournal(heavyMsg, start, start + MOVE_DELAY, 'sys');
      Orion.Wait(1);

      amount = item.max - Orion.Count(item.type, item.color, targetDrop);
    } while (!msg && amount > 0);

    if (Orion.Count(item.type, item.color, targetDrop) < item.min) {
      Orion.CharPrint('self', 0x0021, `Not enough ${item.name}`);
      Orion.PlayWav('Alarm');
      stopBot();
    }
  }
}
