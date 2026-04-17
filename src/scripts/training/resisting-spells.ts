import { sendTelegramMessage } from '@/lib/telegram';
import { toGraphic, toSerial } from '@lib/validators';

const FIRE_FIELD_GRAPHICS = toGraphic('0x398C|0x3996');
const HEAL_COOLDOWN_MS = 5000; // Задержка между командами .bs, чтобы не спамить сервер
const CASTING_DURATION_MS = 3000; // Примерное время каста (подстрой под свой физл/каст спид)
const STEP_OFFSET = 3; // Количество шагов в каждую сторону от стартовой позиции
const CRITICAL_HP_PERCENT = 35; // При каком проценте HP уходим в отхил
const SAFE_HP_PERCENT = 75; // До какого процента HP добиваемся перед продолжением
const LOOP_TICK_MS = 100; // Пауза между итерациями основного цикла

// Серийник "ходока" для парной прокачки — тот, под кого кастер бросает стенку
const WALKER_SERIAL = toSerial('0x003EAC3F');
// Через какое время кастер проверяет, что стенка под напарником ещё жива
const CASTER_CHECK_INTERVAL_MS = 500;
// Максимальная дистанция, на которой кастер готов работать с напарником
const CASTER_MAX_DISTANCE = 10;

interface WalkerState {
  startX: number;
  startY: number;
  startZ: number;
  stepForward: boolean;
  lastHealTime: number;
  isCritical: boolean;
}

function initWalkerState(): WalkerState {
  return {
    startX: Player.X(),
    startY: Player.Y(),
    startZ: Player.Z(),
    stepForward: true,
    lastHealTime: 0,
    isCritical: false,
  };
}

/**
 * Обрабатывает хил и состояние "критическое HP".
 * Возвращает true, если текущую итерацию надо пропустить (ждём отхила).
 */
function handleHealing(state: WalkerState): boolean {
  const hpPercent = (Player.Hits() / Player.MaxHits()) * 100;

  // Команда на хил, если есть что хилить и прошёл кулдаун
  if (hpPercent < 100 && Orion.Now() - state.lastHealTime > HEAL_COOLDOWN_MS) {
    Orion.Say('.bs');
    state.lastHealTime = Orion.Now();
  }

  // Вход в критический режим
  if (hpPercent < CRITICAL_HP_PERCENT && !state.isCritical) {
    Orion.Print('Критическое HP! Останавливаемся для отхила...');
    state.isCritical = true;
  }

  if (state.isCritical) {
    if (hpPercent >= SAFE_HP_PERCENT) {
      Orion.Print('HP восстановлено. Продолжаем кач...');
      state.isCritical = false;
      return false;
    }
    // Ждём отхила — пропускаем движение и каст
    Orion.Wait(500);
    return true;
  }

  return false;
}

/** Проверяет, есть ли стенка огня в радиусе 1 клетки вокруг указанной точки. */
function hasFireFieldAround(x: number, y: number): boolean {
  const fields = Orion.FindType(
    FIRE_FIELD_GRAPHICS,
    'any',
    'ground',
    'item',
    CASTER_MAX_DISTANCE,
  );

  for (let i = 0; i < fields.length; i++) {
    const field = Orion.FindObject(fields[i]);
    if (!field) continue;
    const dx = Math.abs(field.X() - x);
    const dy = Math.abs(field.Y() - y);
    if (dx <= 1 && dy <= 1) {
      return true;
    }
  }

  return false;
}

/**
 * Совершает шаг туда-обратно вдоль оси X относительно стартовой позиции.
 * Возвращает false, если дошли до края и развернулись (полезно для индикации тика).
 */
function stepAlongField(state: WalkerState): void {
  const targetX = state.stepForward
    ? state.startX + STEP_OFFSET
    : state.startX - STEP_OFFSET;

  if (Player.X() !== targetX) {
    Orion.WalkTo(targetX, state.startY, state.startZ, 0, 255, false);
  } else {
    state.stepForward = !state.stepForward;
  }
}

/** Возврат на стартовые координаты, если ходока снесло со спота. */
function returnToStart(state: WalkerState): boolean {
  if (Player.X() !== state.startX || Player.Y() !== state.startY) {
    Orion.WalkTo(state.startX, state.startY, state.startZ, 0, 255, false);
    Orion.Wait(500);
    return true;
  }
  return false;
}

// ==========================================
// Режим 1: Самостоятельная прокачка
// Персонаж сам кастует Fire Field под себя и ходит по нему.
// ==========================================
export function ResistingSpellsSelf() {
  Orion.Print('Запускаем прокачку Magic Resistance (соло режим)...');

  const state = initWalkerState();

  while (!Player.Dead()) {
    if (handleHealing(state)) {
      continue;
    }

    const fireFields = Orion.FindType(
      FIRE_FIELD_GRAPHICS,
      'any',
      'ground',
      'item',
      1,
    );

    // Стенки нет — возможно, снесло со спота, возвращаемся и кастуем заново
    if (fireFields.length === 0) {
      if (returnToStart(state)) {
        continue;
      }

      const hpPercent = (Player.Hits() / Player.MaxHits()) * 100;
      if (hpPercent < 100) {
        Orion.Wait(1000);
        continue;
      }

      Orion.Print('Полное здоровье. Кастуем Fire Field под себя...');
      Orion.WaitTargetTileRelative('any', 0, 0, 0);
      Orion.Cast('Fire Field');
      Orion.Wait(CASTING_DURATION_MS);
      continue;
    }

    stepAlongField(state);
    Orion.Wait(LOOP_TICK_MS);
  }

  Orion.Print('Персонаж мертв. Макрос остановлен.');
  sendTelegramMessage(`${Player.Name()}: Умер`);
}

// ==========================================
// Режим 2: Парная прокачка — ходок
// Только хилится и ходит по полю, стенку кастует напарник.
// ==========================================
export function ResistingSpellsWalker() {
  Orion.Print('Запускаем прокачку Magic Resistance (режим ходока)...');

  const state = initWalkerState();

  while (!Player.Dead()) {
    if (handleHealing(state)) {
      continue;
    }

    const fireFields = Orion.FindType(
      FIRE_FIELD_GRAPHICS,
      'any',
      'ground',
      'item',
      1,
    );

    // Стенки нет — возвращаемся на спот и ждём, пока кастер поставит новую
    if (fireFields.length === 0) {
      if (returnToStart(state)) {
        continue;
      }

      Orion.Wait(500);
      continue;
    }

    stepAlongField(state);
    Orion.Wait(LOOP_TICK_MS);
  }

  Orion.Print('Персонаж мертв. Макрос остановлен.');
  sendTelegramMessage(`${Player.Name()}: Умер`);
}

// ==========================================
// Режим 3: Парная прокачка — кастер
// Следит за напарником и кастует Fire Field под него, когда стенка исчезла.
// ==========================================
export function ResistingSpellsCaster() {
  const target = WALKER_SERIAL;

  Orion.Print('Запускаем прокачку Magic Resistance (режим кастера)...');

  // Фиксируем точку каста по первым валидным координатам напарника,
  // чтобы стенка всегда кастовалась в одно и то же место (центр маршрута ходока).
  let anchorX = -1;
  let anchorY = -1;
  let anchorZ = 0;

  while (true) {
    const partner = Orion.FindObject(target);
    if (!partner) {
      Orion.Print('Напарник не найден в радиусе видимости, ждём...');
      Orion.Wait(1000);
      continue;
    }

    if (Orion.GetDistance(target) > CASTER_MAX_DISTANCE) {
      Orion.Print('Напарник слишком далеко, ждём...');
      Orion.Wait(1000);
      continue;
    }

    // Первый успешный контакт — запоминаем точку каста
    if (anchorX === -1) {
      anchorX = partner.X();
      anchorY = partner.Y();
      anchorZ = partner.Z();
      Orion.Print('Точка каста зафиксирована: ' + anchorX + ',' + anchorY);
    }

    // Проверяем, есть ли уже стенка в зафиксированной точке
    if (hasFireFieldAround(anchorX, anchorY)) {
      Orion.Wait(CASTER_CHECK_INTERVAL_MS);
      continue;
    }

    // Не кастуем, пока напарник не вернулся достаточно близко к точке каста,
    // иначе стенка ляжет мимо и он в неё не попадёт
    const dx = Math.abs(partner.X() - anchorX);
    const dy = Math.abs(partner.Y() - anchorY);
    if (dx > 1 || dy > 1) {
      Orion.Wait(CASTER_CHECK_INTERVAL_MS);
      continue;
    }

    // Стенки нет — ждём достаточной маны и кастуем
    if (Player.Mana() < Player.MaxMana()) {
      Orion.UseSkill('Meditation');
      Orion.Wait(1000);
      continue;
    }

    Orion.Print('Стенка пропала. Кастуем Fire Field в точку каста...');
    Orion.WaitTargetTile('any', anchorX, anchorY, anchorZ);
    Orion.Cast('Fire Field');
    Orion.Wait(CASTING_DURATION_MS);

    // После каста подтверждаем, что стенка появилась, прежде чем идти на следующий тик.
    const waitStart = Orion.Now();
    while (Orion.Now() - waitStart < CASTING_DURATION_MS) {
      if (hasFireFieldAround(anchorX, anchorY)) break;
      Orion.Wait(200);
    }
  }
}
