import { checkLag, stopBot } from '@lib/helpers';
import { toGraphic, toSerial } from '@/lib/validators';
import { restockItems } from '@/lib/container';

// --- Настройки шахтера ---
const MOVE_DELAY = 100;
const WEIGHT_LIMIT = 30; // запас веса до максимума

const FORGE_COORDS: Point2D = { x: 888, y: 1874 };
const CONTAINER_COORDS: Point2D = { x: 890, y: 1875 };
const MINE_COORDS: Point2D = { x: 772, y: 1697 };

const ORE_CONTAINER_SERIAL = toSerial('0x403853AB'); // Контейнер для инготов
const RESOURCES_CONTAINER = toSerial('0x403853AA'); // Контейнер с ресурсами (инструменты, еда)

const TOOL_TYPE = toGraphic('0x0E85|0x0E86');
const ORE_TYPE = toGraphic('0x19B7|0x19B8|0x19B9|0x19BA');
const FOOD_TYPE = toGraphic('0x097B|0x09F2');

const INGOT_TYPE = toGraphic('0x1BEF|0x1BE3|0x1BF5|0x1BE9|0x1BEF');
const FORGE_TYPE = toGraphic('0x0FB1');

const BAD_TILES: Point2D[] = [{ x: 1265, y: 1270 }];

// Глобальная настройка журнала при загрузке скрипта
Orion.JournalIgnoreCase(true);

// ==========================================
// ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ (ТОЧКИ ВХОДА ORION)
// ==========================================

export function Autostart(): void {
  Orion.Exec('Monitor', true);
  Orion.Exec('Eating', true);
  Replenishment();
  checkLag();
  Orion.ResumeScript('all');
}

export { Eating } from '@/lib/eating';
export { Monitor } from '@/lib/status-monitor';
export { getGumpResponse, markTiles } from './mark-tiles';

function setBadTiles(): void {
  for (const tile of BAD_TILES) {
    Orion.SetBadLocation(tile.x, tile.y);
  }
}

function getCaveTiles(): Point2D[] | null {
  const maxDist = 100;
  const route: Point2D[] = [
    { x: 772, y: 1693 },
    { x: 771, y: 1689 },
    { x: 771, y: 1685 },
    { x: 775, y: 1685 },
    { x: 780, y: 1683 },
    { x: 776, y: 1682 },
    { x: 781, y: 1680 },
    { x: 778, y: 1678 },
    { x: 778, y: 1674 },
    { x: 775, y: 1673 },
    { x: 772, y: 1675 },
    { x: 768, y: 1676 },
    { x: 770, y: 1679 },
    { x: 768, y: 1683 },
  ];

  // Ищем ближайший тайл с помощью современного метода
  let closestTile = route[0];
  let minDist = Orion.GetDistance(closestTile.x, closestTile.y);

  for (const tile of route) {
    const dist = Orion.GetDistance(tile.x, tile.y);
    if (dist < minDist) {
      minDist = dist;
      closestTile = tile;
    }
  }

  if (minDist > maxDist) {
    Orion.CharPrint('self', 0x0021, 'Unknown location');
    Orion.PlayWav('Alarm');
    return null;
  }

  return route; // В оригинале возвращался весь массив маршрута
}

export function Dig(): void {
  const endMsg =
    'You loosen some rocks|ore in your|ores in your|another action';
  const stopMsg =
    'That is too far away|You have no line of sight to that location|There is no ore here to mine|You cannot mine so close to yourself|pickaxe damaged|Try mining in rock';
  const msg = `${endMsg}|${stopMsg}`;

  const tiles = getCaveTiles();
  if (!tiles) return;

  for (const tile of tiles as any) {
    // Приведение типа, так как getCaveTiles логически в оригинале возвращал массив точек
    checkLag();
    setBadTiles();

    if (!Orion.WalkTo(tile.x, tile.y, Player.Z(), 0, 255, true, true)) {
      Orion.Print(`Can't walk to ${tile.x} ${tile.y}`);
      Orion.Wait(100);
      continue;
    }

    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        if (
          (x === 0 && y === 0) ||
          (Math.abs(x) === 2 && Math.abs(y) === 2) ||
          !Orion.ValidateTargetTileRelative('cave', x, y)
        ) {
          continue;
        }

        let miningFinished = false;
        do {
          Orion.Wait(1);
          checkLag();

          const start = Orion.Now();
          const delay = 10000;

          Orion.WaitTargetTileRelative('cave', x, y, 0);

          if (
            Player.Weight() >= Player.MaxWeight() - WEIGHT_LIMIT ||
            !Orion.UseType(TOOL_TYPE)
          ) {
            Orion.CancelWaitTarget();
            SmeltOre();
            DropIngots();
            Replenishment();
            ReturnToMine();

            if (!Orion.WalkTo(tile.x, tile.y, Player.Z(), 0, 255, true, true)) {
              Orion.Print("Can't walk back to mining tile");
              break;
            }
          }

          while (
            !Orion.InJournal(msg, 'my|sys', 0, 'any', start) &&
            Orion.Now() < start + delay
          ) {
            Orion.Wait(100);
          }

          if (Orion.InJournal('pickaxe damaged', 'my|sys', 0, 'any', start)) {
            checkLag();
            Orion.DropHere('lastobject');
            Orion.Wait(200);
          }

          miningFinished = !!Orion.InJournal(
            stopMsg,
            'my|sys',
            0,
            'any',
            start,
          );
        } while (!miningFinished);

        Orion.Wait(1400);
      }
    }
  }
}

export function Mining(): void {
  while (true) {
    Orion.Exec('Dig', true);
    while (Orion.ScriptRunning('Dig')) {
      Orion.Wait(100);
    }
  }
}

export function SmeltOre(): void {
  Orion.Print('Иду плавить руду');
  checkLag();
  Orion.WalkTo(FORGE_COORDS.x, FORGE_COORDS.y, Player.Z(), 1, 255, false, true);
  Orion.Wait(500);

  const forge = Orion.FindType(FORGE_TYPE, 'any', 'ground', '', 2);

  if (!forge.length) {
    Orion.Print('Плавилка не найдена!');
    return;
  }

  const ores = Orion.FindType(ORE_TYPE, '!0x0000', 'backpack');
  for (const ore of ores) {
    checkLag();
    Orion.UseObject(forge[0]); // Orion.FindType возвращает массив серийников
    Orion.WaitTargetObject(ore);
    Orion.Wait(800);
  }
  Orion.Wait(1000);
}

export function DropIngots(): void {
  Orion.Print('Иду сбрасывать инготы');
  Orion.WalkTo(
    CONTAINER_COORDS.x,
    CONTAINER_COORDS.y,
    Player.Z(),
    1,
    255,
    true,
  );

  const chestObj = Orion.FindObject(ORE_CONTAINER_SERIAL);

  if (!chestObj) {
    Orion.CharPrint('self', 0x0021, 'Ingot chest not found!');
    Orion.PlayWav('Alarm');
    stopBot();
    return;
  }

  checkLag();
  Orion.Wait(500);

  const ingots = Orion.FindType(INGOT_TYPE, 'any', 'backpack');
  for (const ingot of ingots) {
    checkLag();
    Orion.MoveItem(ingot, 0, ORE_CONTAINER_SERIAL);
    Orion.Wait(MOVE_DELAY);
  }

  Orion.Wait(100);

  const ores = Orion.FindType(ORE_TYPE, 'any', 'backpack');
  for (const ore of ores) {
    checkLag();
    Orion.MoveItem(ore, 0, ORE_CONTAINER_SERIAL);
    Orion.Wait(MOVE_DELAY);
  }
}

export function Replenishment(): void {
  const resourceContainer = Orion.FindObject(RESOURCES_CONTAINER);

  Orion.WalkTo(
    resourceContainer?.X() || CONTAINER_COORDS.x,
    resourceContainer?.Y() || CONTAINER_COORDS.y,
    Player.Z(),
    1,
    255,
    true,
  );

  restockItems(
    [
      {
        name: 'pickaxe',
        type: TOOL_TYPE,
        color: 'any',
        max: 4,
        min: 3,
        box: 'self',
        x: -1,
        y: -1,
      },
      {
        name: 'food',
        type: FOOD_TYPE,
        color: 'any',
        max: 10,
        min: 5,
        box: 'self',
        x: -1,
        y: -1,
      },
    ],
    RESOURCES_CONTAINER,
  );

  if (!Orion.ScriptRunning('ReturnToMine')) {
    Orion.Exec('ReturnToMine', true);
  }
}

export function ReturnToMine(): void {
  Orion.Print('Возвращаюсь в шахту');
  checkLag();
  Orion.WalkTo(MINE_COORDS.x, MINE_COORDS.y, Player.Z(), 1, 255, true, true);
  if (!Orion.ScriptRunning('Mining')) {
    Orion.Exec('Mining', true);
  }
}
