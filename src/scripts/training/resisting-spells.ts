import { sendTelegramMessage } from '@/lib/telegram';
import { toGraphic } from '@lib/validators';

const FIRE_FIELD_GRAPHICS = toGraphic('0x398C|0x3996');
const HEAL_COOLDOWN_MS = 5000; // Задержка между командами .bs, чтобы не спамить сервер
const CAST_DELAY_MS = 3000; // Примерное время каста (подстрой под свой физл/каст спид)
const STEP_OFFSET = 3; // Количество шагов в каждую сторону

export function ResistingSpells() {
  Orion.Print('Запускаем прокачку Magic Resistance...');

  let lastHealTime = 0;
  let isCritical = false;

  // Запоминаем стартовые координаты для шагов туда-сюда
  const startX = Player.X();
  const startY = Player.Y();
  const startZ = Player.Z();

  // Флаг направления: true = идем вперед (X + 1), false = возвращаемся назад (X)
  let stepForward = true;

  while (!Player.Dead()) {
    // Считаем текущий процент здоровья
    const hpPercent = (Player.Hits() / Player.MaxHits()) * 100;

    // --- 1. ЛОГИКА ХИЛА ---
    // Если хп меньше 100% и прошел кулдаун хила, отправляем команду серверу
    if (hpPercent < 100 && Orion.Now() - lastHealTime > HEAL_COOLDOWN_MS) {
      Orion.Say('.bs'); //
      lastHealTime = Orion.Now(); //
    }

    // Проверка на критическое ХП (меньше 20%)
    if (hpPercent < 35 && !isCritical) {
      Orion.Print('Критическое HP! Останавливаемся для отхила...');
      isCritical = true;
    }

    // Если мы в критическом состоянии
    if (isCritical) {
      if (hpPercent >= 75) {
        Orion.Print('HP восстановлено до 75%. Продолжаем кач...');
        isCritical = false;
      } else {
        // Просто ждем отхила, пропускаем каст и движение в этой итерации
        Orion.Wait(500); //
        continue;
      }
    }

    // --- 2. ПРОВЕРКА И КАСТ FIRE FIELD ---
    // Ищем объекты поля на земле в радиусе 1 клетки
    const fireFields = Orion.FindType(
      FIRE_FIELD_GRAPHICS,
      'any',
      'ground',
      'item',
      1,
    ); //

    if (fireFields.length === 0) {
      if (Player.X() !== startX || Player.Y() !== startY) {
        Orion.WalkTo(startX, startY, startY, 0, 255, false);
        Orion.Wait(500);
        continue;
      }

      if (hpPercent < 100) {
        Orion.Wait(1000);
        continue;
      }
      Orion.Print('Полное здоровье. Кастуем Fire Field под себя...');
      Orion.WaitTargetTileRelative('any', 0, 0, 0);
      Orion.Cast('Fire Field');
      Orion.Wait(CAST_DELAY_MS); // Ждем пока скастуется
      continue;
    }

    // --- 3. ХОЖДЕНИЕ ПО ПОЛЮ ---
    // Определяем целевую координату по оси X
    const targetX = stepForward ? startX + STEP_OFFSET : startX - STEP_OFFSET;

    // Если мы еще не на целевой клетке — делаем шаг
    if (Player.X() !== targetX) {
      // Идем в координаты шагом (false)
      Orion.WalkTo(targetX, startY, startZ, 0, 255, false); //
      // Orion.Wait(500); // Небольшая пауза на анимацию шага
    } else {
      // Если дошли до целевой клетки, меняем направление для следующего круга
      stepForward = !stepForward;
    }

    // Разгружаем процессор небольшим слипом
    Orion.Wait(100); //
  }

  Orion.Print('Персонаж мертв. Макрос остановлен.');
  sendTelegramMessage(`${Player.Name()}: Умер`)
}
