import { checkLag, stopBot } from '@lib/helpers';
import { toGraphic, toSerial } from '@/lib/validators';
import { restockItems } from '@/lib/container';

// --- Настройки рыбака ---
const MOVE_DELAY = 100;
const WEIGHT_LIMIT = 30; // запас веса до максимума
const CAST_TIMEOUT = 15000; // таймаут ожидания улова

const FISH_CONTAINER_SERIAL = toSerial('0x403853AB'); // Контейнер для рыбы
const RESOURCES_CONTAINER = toSerial('0x403853AA'); // Контейнер с ресурсами

const POLE_TYPE = toGraphic('0x0DBF|0x0DC0'); // Удочка
const FISH_STEAK_TYPE = toGraphic('0x097A'); // Рыбные стейки
const FISH_TYPE = toGraphic(
  '0x09CC|0x09CD|0x09CE|0x09CF|0x0DD6|0x0DD7',
); // Сырая рыба разных видов
const SHOES_TYPE = toGraphic('0x170D|0x170E'); // Обувь (мусор)
const BONES_TYPE = toGraphic('0x0ECA|0x0ECB'); // Кости (мусор)

// Глобальная настройка журнала при загрузке скрипта
Orion.JournalIgnoreCase(true);

// ==========================================
// МАРШРУТ
// ==========================================

/** Точки на берегу, откуда ловим */
const SHORE_ROUTE: Point2D[] = [
  { x: 897, y: 1876 },
  { x: 900, y: 1876 },
  { x: 903, y: 1876 },
];

/**
 * Тайлы воды относительно позиции персонажа для заброса.
 * Каждая точка маршрута ловит по этим относительным координатам.
 */
const WATER_OFFSETS: Point2D[] = [
  { x: 0, y: -4 },
  { x: 1, y: -4 },
  { x: -1, y: -4 },
  { x: 2, y: -3 },
  { x: -2, y: -3 },
  { x: 0, y: -3 },
  { x: 3, y: -2 },
  { x: -3, y: -2 },
];

// ==========================================
// ЭКСПОРТИРУЕМЫЕ ФУНКЦИИ (ТОЧКИ ВХОДА ORION)
// ==========================================

export function Autostart(): void {
  Orion.Exec('Monitor', true);
  Orion.Exec('Eating', true);
  Orion.Exec('Resurrect', true);
  Replenishment();
  checkLag();
  Orion.ResumeScript('all');
}

export { Eating } from '@/lib/eating';
export { Monitor } from '@/lib/status-monitor';
export { Resurrect } from '@/lib/resurrect';

// ==========================================
// ОСНОВНОЙ ЦИКЛ РЫБАЛКИ
// ==========================================

export function Fish(): void {
  for (var i = 0; i < SHORE_ROUTE.length; i++) {
    var spot = SHORE_ROUTE[i];
    checkLag();

    if (!Orion.WalkTo(spot.x, spot.y, Player.Z(), 0, 255, false)) {
      Orion.Print('Не могу дойти до ' + spot.x + ' ' + spot.y);
      Orion.Wait(100);
      continue;
    }

    fishAtSpot();
  }
}

export function Fishing(): void {
  while (true) {
    Orion.Exec('Fish', true);
    while (Orion.ScriptRunning('Fish')) {
      Orion.Wait(100);
    }
  }
}

// ==========================================
// ЛОГИКА РЫБАЛКИ В ТОЧКЕ
// ==========================================

function fishAtSpot(): void {
  for (var i = 0; i < WATER_OFFSETS.length; i++) {
    var offset = WATER_OFFSETS[i];

    if (
      !Orion.ValidateTargetTileRelative('water', offset.x, offset.y)
    ) {
      continue;
    }

    var tileEmpty = false;

    while (!tileEmpty) {
      Orion.Wait(1);
      checkLag();

      // Проверяем перевес
      if (Player.Weight() >= Player.MaxWeight() - WEIGHT_LIMIT) {
        handleOverweight();

        // Возвращаемся к текущей точке
        var currentSpot = getCurrentSpot();
        if (
          currentSpot &&
          !Orion.WalkTo(
            currentSpot.x,
            currentSpot.y,
            Player.Z(),
            0,
            255,
            true,
            true,
          )
        ) {
          Orion.Print('Не могу вернуться к точке рыбалки');
          return;
        }
      }

      // Проверяем наличие удочки
      if (!Orion.FindType(POLE_TYPE, 'any', 'backpack').length) {
        Orion.CharPrint('self', 0x0021, 'Нет удочки!');
        Orion.PlayWav('Alarm');
        stopBot();
        return;
      }

      var start = Orion.Now();
      Orion.WaitTargetTileRelative('water', offset.x, offset.y, 0);
      Orion.UseType(POLE_TYPE);

      // Ждем результат заброса
      tileEmpty = waitForFishResult(start);
    }
  }
}

// ==========================================
// ОЖИДАНИЕ РЕЗУЛЬТАТА ЗАБРОСА
// ==========================================

function waitForFishResult(start: number): boolean {
  var successMsg =
    'You pull out|You fish up';
  var emptyMsg =
    'There are no fish here|The fish aren\'t biting here|You need to be closer to the water';
  var failMsg =
    'You pull out an old shoe|You pull out some old bones|That is too far away';

  var allMsg = successMsg + '|' + emptyMsg + '|' + failMsg;

  while (
    !Orion.InJournal(allMsg, 'my|sys', 0, 'any', start) &&
    Orion.Now() < start + CAST_TIMEOUT
  ) {
    Orion.Wait(100);
  }

  // Тайл пуст — переходим к следующему
  if (Orion.InJournal(emptyMsg, 'my|sys', 0, 'any', start)) {
    return true;
  }

  // Вытащили мусор — выбрасываем
  if (Orion.InJournal(failMsg, 'my|sys', 0, 'any', start)) {
    dropTrash();
    return false;
  }

  // Поймали рыбу — продолжаем в этом тайле
  if (Orion.InJournal(successMsg, 'my|sys', 0, 'any', start)) {
    return false;
  }

  // Таймаут — пробуем дальше
  return false;
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

/** Текущий спот (ближайший из маршрута) */
function getCurrentSpot(): Point2D | null {
  var closest = SHORE_ROUTE[0];
  var minDist = Orion.GetDistance(closest.x, closest.y);

  for (var i = 1; i < SHORE_ROUTE.length; i++) {
    var dist = Orion.GetDistance(SHORE_ROUTE[i].x, SHORE_ROUTE[i].y);
    if (dist < minDist) {
      minDist = dist;
      closest = SHORE_ROUTE[i];
    }
  }

  return closest;
}

/** Выбросить мусор из рюкзака */
function dropTrash(): void {
  var shoes = Orion.FindType(SHOES_TYPE, 'any', 'backpack');
  for (var i = 0; i < shoes.length; i++) {
    Orion.DropHere(shoes[i]);
    Orion.Wait(MOVE_DELAY);
  }

  var bones = Orion.FindType(BONES_TYPE, 'any', 'backpack');
  for (var i = 0; i < bones.length; i++) {
    Orion.DropHere(bones[i]);
    Orion.Wait(MOVE_DELAY);
  }
}

/** Обработка перевеса: сбросить рыбу в контейнер */
function handleOverweight(): void {
  DropFish();
  Replenishment();
}

/** Сбросить улов в контейнер */
export function DropFish(): void {
  Orion.Print('Иду сбрасывать рыбу');

  var chestObj = Orion.FindObject(FISH_CONTAINER_SERIAL);

  if (!chestObj) {
    Orion.CharPrint('self', 0x0021, 'Контейнер для рыбы не найден!');
    Orion.PlayWav('Alarm');
    stopBot();
    return;
  }

  Orion.WalkTo(chestObj.X(), chestObj.Y(), Player.Z(), 1, 255, true);
  checkLag();
  Orion.Wait(500);

  // Сбрасываем сырую рыбу
  var fish = Orion.FindType(FISH_TYPE, 'any', 'backpack');
  for (var i = 0; i < fish.length; i++) {
    checkLag();
    Orion.MoveItem(fish[i], 0, FISH_CONTAINER_SERIAL);
    Orion.Wait(MOVE_DELAY);
  }

  // Сбрасываем рыбные стейки
  var steaks = Orion.FindType(FISH_STEAK_TYPE, 'any', 'backpack');
  for (var i = 0; i < steaks.length; i++) {
    checkLag();
    Orion.MoveItem(steaks[i], 0, FISH_CONTAINER_SERIAL);
    Orion.Wait(MOVE_DELAY);
  }
}

/** Пополнение ресурсов (удочки) */
export function Replenishment(): void {
  var resourceContainer = Orion.FindObject(RESOURCES_CONTAINER);

  Orion.WalkTo(
    resourceContainer ? resourceContainer.X() : Player.X(),
    resourceContainer ? resourceContainer.Y() : Player.Y(),
    Player.Z(),
    1,
    255,
    true,
  );

  restockItems(
    [
      {
        name: 'fishing pole',
        type: POLE_TYPE,
        color: 'any',
        max: 2,
        min: 1,
        box: 'self',
        x: -1,
        y: -1,
      },
    ],
    RESOURCES_CONTAINER,
  );
}

export function Finish(): void {
  stopBot('Finish|DropFish');
  Orion.Wait(100);
  DropFish();
}
