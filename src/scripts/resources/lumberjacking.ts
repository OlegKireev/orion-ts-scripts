import { toSerial, toGraphic } from '@/lib/validators';
import {
  DropItem,
  dropItems,
  RestockItem,
  restockItems,
} from '@/lib/container';
import { checkLag, stopBot } from '@/lib/helpers';

// --- Настройки ---
const CHEST_SERIAL = toSerial('0x403853A1');
const HOME_COORDS: Point2D = { x: 898, y: 1874 };
const WEIGHT_LIMIT_RESERVE = 100; // минус от максимального веса для возврата
const TOOL_TYPE = toGraphic('0x0F43|0x0F44');

const LUMBER_RESTOCK: RestockItem[] = [
  {
    name: 'hatchet',
    type: TOOL_TYPE,
    color: 'any',
    max: 3,
    min: 1,
    box: 'self',
    x: -1,
    y: -1,
  },
];

const LUMBER_DROP: DropItem[] = [
  { type: toGraphic('0x1BDD'), color: 'any' }, // Logs
  { type: toGraphic('0x0F90'), color: 'any' }, // Red wood
];

const BAD_TILES: Point2D[] = [{ x: 897, y: 1873 }];

// Массив маршрутов (каждый маршрут - это массив точек)
const ROUTES: Point2D[][] = [
  [
    { x: 848, y: 1815 },
    { x: 844, y: 1812 },
    { x: 848, y: 1812 },
    { x: 848, y: 1809 },
    { x: 844, y: 1803 },
    { x: 848, y: 1803 },
    { x: 856, y: 1809 },
    { x: 856, y: 1803 },
    { x: 856, y: 1800 },
    { x: 852, y: 1800 },
    { x: 848, y: 1800 },
    { x: 848, y: 1797 },
    { x: 852, y: 1794 },
    { x: 848, y: 1794 },
    { x: 836, y: 1797 },
    { x: 836, y: 1800 },
    { x: 836, y: 1803 },
    { x: 832, y: 1800 },
    { x: 832, y: 1797 },
    { x: 828, y: 1797 },
    { x: 836, y: 1788 },
    { x: 836, y: 1785 },
    { x: 832, y: 1785 },
    { x: 836, y: 1776 },
    { x: 836, y: 1779 },
    { x: 828, y: 1779 },
    { x: 824, y: 1773 },
    { x: 824, y: 1776 },
    { x: 820, y: 1776 },
    { x: 820, y: 1773 },
    { x: 820, y: 1770 },
    { x: 816, y: 1773 },
    { x: 828, y: 1770 },
    { x: 824, y: 1770 },
    { x: 820, y: 1764 },
    { x: 824, y: 1761 },
    { x: 828, y: 1761 },
    { x: 832, y: 1761 },
    { x: 828, y: 1755 },
    { x: 832, y: 1755 },
    { x: 832, y: 1758 },
    { x: 828, y: 1752 },
    { x: 824, y: 1755 },
    { x: 824, y: 1758 },
    { x: 820, y: 1758 },
    { x: 820, y: 1755 },
    { x: 824, y: 1749 },
    { x: 820, y: 1749 },
    { x: 820, y: 1752 },
    { x: 812, y: 1755 },
    { x: 816, y: 1755 },
    { x: 812, y: 1758 },
    { x: 808, y: 1761 },
    { x: 828, y: 1746 },
    { x: 828, y: 1749 },
    { x: 832, y: 1746 },
    { x: 812, y: 1749 },
    { x: 812, y: 1746 },
    { x: 808, y: 1749 },
    { x: 808, y: 1746 },
    { x: 808, y: 1743 },
    { x: 816, y: 1740 },
    { x: 812, y: 1740 },
    { x: 808, y: 1740 },
    { x: 808, y: 1737 },
    { x: 820, y: 1737 },
    { x: 820, y: 1734 },
    { x: 816, y: 1734 },
    { x: 816, y: 1728 },
    { x: 824, y: 1728 },
    { x: 824, y: 1725 },
    { x: 820, y: 1725 },
    { x: 816, y: 1725 },
    { x: 808, y: 1734 },
    { x: 808, y: 1731 },
    { x: 808, y: 1728 },
    { x: 808, y: 1725 },
    { x: 808, y: 1722 },
    { x: 804, y: 1725 },
    { x: 804, y: 1728 },
    { x: 804, y: 1731 },
    { x: 804, y: 1734 },
    { x: 804, y: 1737 },
    { x: 800, y: 1740 },
    { x: 796, y: 1743 },
    { x: 796, y: 1740 },
    { x: 796, y: 1737 },
    { x: 800, y: 1728 },
    { x: 800, y: 1731 },
    { x: 792, y: 1734 },
    { x: 792, y: 1731 },
    { x: 788, y: 1731 },
    { x: 788, y: 1734 },
    { x: 788, y: 1737 },
    { x: 788, y: 1722 },
    { x: 784, y: 1725 },
    { x: 784, y: 1719 },
    { x: 788, y: 1716 },
    { x: 792, y: 1716 },
    { x: 796, y: 1716 },
    { x: 796, y: 1719 },
    { x: 800, y: 1719 },
    { x: 800, y: 1713 },
    { x: 800, y: 1710 },
    { x: 800, y: 1707 },
    { x: 796, y: 1707 },
    { x: 792, y: 1707 },
    { x: 792, y: 1710 },
    { x: 788, y: 1710 },
    { x: 800, y: 1704 },
    { x: 796, y: 1701 },
    { x: 792, y: 1701 },
    { x: 788, y: 1704 },
    { x: 788, y: 1701 },
    { x: 788, y: 1698 },
    { x: 788, y: 1695 },
    { x: 792, y: 1695 },
    { x: 796, y: 1695 },
    { x: 792, y: 1692 },
    { x: 796, y: 1698 },
    { x: 800, y: 1698 },
    { x: 804, y: 1698 },
    { x: 808, y: 1701 },
    { x: 808, y: 1698 },
    { x: 808, y: 1695 },
    { x: 804, y: 1695 },
    { x: 804, y: 1704 },
    { x: 804, y: 1707 },
    { x: 804, y: 1710 },
    { x: 772, y: 1716 },
    { x: 772, y: 1719 },
    { x: 776, y: 1716 },
    { x: 780, y: 1716 },
    { x: 780, y: 1722 },
    { x: 776, y: 1722 },
    { x: 768, y: 1722 },
    { x: 768, y: 1725 },
    { x: 764, y: 1722 },
    { x: 764, y: 1725 },
    { x: 764, y: 1719 },
    { x: 764, y: 1716 },
    { x: 764, y: 1713 },
    { x: 760, y: 1713 },
    { x: 760, y: 1710 },
    { x: 756, y: 1713 },
    { x: 756, y: 1710 },
    { x: 756, y: 1707 },
    { x: 760, y: 1704 },
    { x: 760, y: 1707 },
    { x: 756, y: 1719 },
    { x: 756, y: 1722 },
    { x: 756, y: 1725 },
    { x: 752, y: 1725 },
    { x: 752, y: 1722 },
    { x: 748, y: 1716 },
    { x: 748, y: 1725 },
    { x: 748, y: 1728 },
    { x: 744, y: 1731 },
    { x: 744, y: 1734 },
    { x: 744, y: 1737 },
    { x: 744, y: 1722 },
    { x: 744, y: 1719 },
    { x: 740, y: 1719 },
    { x: 744, y: 1716 },
    { x: 740, y: 1713 },
    { x: 740, y: 1710 },
    { x: 744, y: 1713 },
    { x: 736, y: 1707 },
    { x: 732, y: 1710 },
    { x: 732, y: 1716 },
    { x: 732, y: 1719 },
    { x: 728, y: 1716 },
    { x: 728, y: 1719 },
    { x: 728, y: 1722 },
    { x: 724, y: 1719 },
    { x: 724, y: 1713 },
    { x: 724, y: 1710 },
    { x: 728, y: 1707 },
    { x: 728, y: 1710 },
    { x: 728, y: 1704 },
    { x: 732, y: 1701 },
    { x: 740, y: 1701 },
    { x: 728, y: 1695 },
    { x: 728, y: 1698 },
    { x: 724, y: 1701 },
    { x: 720, y: 1701 },
    { x: 720, y: 1704 },
    { x: 724, y: 1695 },
    { x: 724, y: 1692 },
    { x: 720, y: 1695 },
    { x: 716, y: 1695 },
    { x: 716, y: 1701 },
    { x: 716, y: 1704 },
    { x: 712, y: 1704 },
    { x: 712, y: 1710 },
    { x: 712, y: 1698 },
    { x: 712, y: 1692 },
    { x: 716, y: 1692 },
    { x: 716, y: 1716 },
    { x: 712, y: 1716 },
    { x: 708, y: 1716 },
    { x: 712, y: 1719 },
    { x: 716, y: 1722 },
    { x: 720, y: 1722 },
  ],
];

// ==========================================
// ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ
// ==========================================

export { Monitor } from '@/lib/status-monitor';

export function Autostart(): void {
  Orion.JournalIgnoreCase(true);
  Orion.Exec('Monitor', true); // Раскомментируй, если у тебя есть глобальный скрипт мониторинга
  checkLag();
  Lumberjacking(); // Вызываем напрямую
}

function setBadTiles(): void {
  for (const tile of BAD_TILES) {
    Orion.SetBadLocation(tile.x, tile.y);
  }
}

function getTreeTiles(): Point2D[] | null {
  const maxDist = 100;

  for (const route of ROUTES) {
    // Проверяем дистанцию до первой точки маршрута
    if (Orion.GetDistance(route[0].x, route[0].y) <= maxDist) {
      return route;
    }
  }

  Orion.Print('Неизвестная местность!');
  Orion.PlayWav('Alarm');
  return null;
}

export function Lumberjacking(): void {
  while (true) {
    checkLag();
    Orion.WalkTo(HOME_COORDS.x, HOME_COORDS.y, Player.Z(), 0, 255, false, true);
    checkLag();
    Orion.Say('BANK');

    const chestObj = Orion.FindObject(CHEST_SERIAL);
    if (!chestObj) {
      Orion.CharPrint('self', 0x0021, "Can't find chest");
      Orion.PlayWav('Alarm');
      stopBot();
      return; // Остановка выполнения, если stopBot() не выбрасывает ошибку
    }

    checkLag();
    Orion.WalkTo(chestObj.X(), chestObj.Y(), chestObj.Z(), 1, 255, true, true);

    dropItems(LUMBER_DROP, 'backpack', CHEST_SERIAL);
    restockItems(LUMBER_RESTOCK, CHEST_SERIAL, 'backpack');

    // Запускаем цикл рубки
    Hack();
  }
}

function Hack(): void {
  const endMsg = 'You hack at the tree|put the log';
  const stopMsg =
    "Try chopping a tree|That is too far away|You can't reach this|There are no logs";
  const msg = `${endMsg}|${stopMsg}`;

  const tiles = getTreeTiles();
  if (!tiles || tiles.length === 0) return;

  for (const tile of tiles) {
    checkLag();
    setBadTiles();

    if (!Orion.WalkTo(tile.x, tile.y, Player.Z(), 1, 255, true, true)) {
      Orion.Print(`Can't walk to ${tile.x} ${tile.y}`);
      Orion.Wait(100);
      continue;
    }

    let isChoppingDone = false;

    do {
      Orion.Wait(1);
      checkLag();

      const start = Orion.Now();
      const delay = 10000;

      Orion.WaitTargetTile('tree', tile.x, tile.y, 0);

      // Проверка перевеса или отсутствия топора
      if (
        Player.Weight() >= Player.MaxWeight() - WEIGHT_LIMIT_RESERVE ||
        !Orion.UseType(TOOL_TYPE)
      ) {
        Orion.CancelWaitTarget(); // Обязательно снимаем таргет перед уходом
        checkLag();
        Orion.Print('WALK TO HOME');
        Orion.WalkTo(
          HOME_COORDS.x,
          HOME_COORDS.y,
          Player.Z(),
          0,
          255,
          true,
          true,
        );

        const chestObj = Orion.FindObject(CHEST_SERIAL);
        if (!chestObj) {
          Orion.CharPrint('self', 0x0021, "Can't find chest");
          Orion.PlayWav('Alarm');
          stopBot();
          return;
        }

        checkLag();
        Orion.WalkTo(
          chestObj.X(),
          chestObj.Y(),
          chestObj.Z(),
          1,
          255,
          true,
          true,
        );
        dropItems(LUMBER_DROP, 'backpack', CHEST_SERIAL);
        restockItems(LUMBER_RESTOCK, CHEST_SERIAL, 'backpack');
        checkLag();

        // Возвращаемся к дереву
        if (!Orion.WalkTo(tile.x, tile.y, Player.Z(), 1, 255, true, true)) {
          Orion.Print(`Can't walk back to ${tile.x} ${tile.y}`);
          break; // Прерываем рубку текущего дерева и идем к следующему
        }
      }

      while (
        !Orion.InJournal(msg, 'my|sys', 0, 'any', start) &&
        Orion.Now() < start + delay
      ) {
        Orion.Wait(100);
      }

      // Если инструмент сломался (заменил pickaxe на универсальное damaged/destroyed)
      if (
        Orion.InJournal('damaged|destroyed|broke', 'my|sys', 0, 'any', start)
      ) {
        checkLag();
        Orion.DropHere('lastobject');
        Orion.Wait(200);
      }

      isChoppingDone = !!Orion.InJournal(stopMsg, 'my|sys', 0, 'any', start);
    } while (!isChoppingDone);

    Orion.Wait(1400);
  }
}
