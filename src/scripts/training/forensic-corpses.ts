import { toGraphic, toSerial } from '@lib/validators';
import { checkLag } from '@/lib/helpers';

const KILLER_SERIAL = toSerial('0x003D096F');
const CORPSE_GRAPHIC = toGraphic('0x2006');
const CORPSE_SEARCH_RADIUS = 5;

const RESURRECT_COORDS = { x: 969, y: 1769 };
const SAFE_DISTANCE = 2; // Не подходить к убийце ближе этого расстояния

// Тренировка Forensic Evaluation: создание трупов для последующего изучения.
// Персонаж проверяет наличие своего трупа рядом. Если трупа нет — снимает оружие,
// подходит к убийце, бьёт его, ждёт смерти, бежит на ресалку, воскресается,
// возвращается к начальной позиции. Повторяет раз в 10 секунд.
export function ForensicCorpses(): void {
  Orion.Print('Запуск скрипта создания трупов для Forensic...');

  const startX = Player.X();
  const startY = Player.Y();
  const startZ = Player.Z();

  while (true) {
    // Проверяем наличие трупа в радиусе
    const corpses = Orion.FindType(
      CORPSE_GRAPHIC,
      'any',
      'ground',
      'fast',
      CORPSE_SEARCH_RADIUS,
    );

    if (corpses.length > 0) {
      // Труп есть — ждём и проверяем снова
      Orion.Wait(10000);
      continue;
    }

    // Трупа нет — создаём новый
    Orion.Print('Труп не найден. Начинаем цикл...');

    // 1. Снимаем оружие
    unEquipWeapons();

    // 2. Подходим к убийце и получаем удар
    dieToKiller();

    // 3. Бежим на ресалку и воскресаемся
    resurrect();

    // 4. Возвращаемся к начальной позиции (не вплотную к убийце)
    returnToStart(startX, startY, startZ);

    Orion.Print('Цикл завершён. Ждём исчезновения трупа...');
    Orion.Wait(5000);
  }
}

function unEquipWeapons(): void {
  var rightHand = Orion.ObjAtLayer('RightHand');
  if (rightHand) {
    Orion.MoveItem(rightHand.Serial(), 0, 'backpack');
    Orion.Wait(500);
  }

  var leftHand = Orion.ObjAtLayer('LeftHand');
  if (leftHand) {
    Orion.MoveItem(leftHand.Serial(), 0, 'backpack');
    Orion.Wait(500);
  }
}

function dieToKiller(): void {
  var killer = Orion.FindObject(KILLER_SERIAL);
  if (!killer) {
    Orion.Print('Убийца не найден!');
    return;
  }

  // Подходим к убийце
  checkLag();
  Orion.WalkTo(killer.X(), killer.Y(), killer.Z(), 1, 255, true, true);
  Orion.Wait(300);

  // Включаем боевой режим и бьём
  Orion.WarMode(1);
  Orion.Wait(200);
  Orion.Attack(KILLER_SERIAL);
  Orion.Wait(500);

  // Ждём смерти
  Orion.Print('Ждём смерти от убийцы...');
  while (!Player.Dead()) {
    Orion.Wait(500);
  }

  Orion.WarMode(0);
  Orion.Print('Персонаж убит.');
}

function resurrect(): void {
  Orion.Print('Бежим на ресалку...');
  checkLag();
  Orion.WalkTo(
    RESURRECT_COORDS.x,
    RESURRECT_COORDS.y,
    Player.Z(),
    0,
    255,
    true,
    true,
  );

  // Ходим по точке ресалки пока не воскреснем
  var attempts = 0;
  while (Player.Dead()) {
    Orion.WalkTo(
      RESURRECT_COORDS.x,
      RESURRECT_COORDS.y,
      Player.Z(),
      0,
      255,
      true,
      true,
    );
    Orion.Wait(1000);
    attempts++;
    if (attempts > 30) {
      Orion.Print('Не удалось воскреснуть за 30 попыток!');
      break;
    }
  }

  if (!Player.Dead()) {
    Orion.Print('Воскресли!');
  }
}

function returnToStart(x: number, y: number, z: number): void {
  Orion.Print('Возвращаемся к начальной позиции...');
  checkLag();

  // Проверяем, не слишком ли близко начальная точка к убийце
  var killer = Orion.FindObject(KILLER_SERIAL);
  if (killer && Orion.GetDistance(killer.X(), killer.Y()) <= SAFE_DISTANCE) {
    // Идём к начальной точке, но останавливаемся на безопасном расстоянии
    Orion.WalkTo(x, y, z, SAFE_DISTANCE, 255, true, true);
  } else {
    Orion.WalkTo(x, y, z, 0, 255, true, true);
  }

  Orion.Wait(500);
}
