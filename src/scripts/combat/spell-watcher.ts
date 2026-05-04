/**
 * Spell Watcher — отслеживает мантры кастов в журнале и надевает резист-шкуру
 * соответствующей школы магии.
 */

import { MagicSchool, SpellDef, SPELLS } from '@/constants/spell';
import { toGraphic } from '@lib/validators';

interface ItemDef {
  graphic: Graphic;
  color: string;
}

interface WatcherState {
  currentSchool: MagicSchool | null;
  currentSkinSerial: Serial | null;
  defaultSkinSerials: Serial[];
  isDefaultEquipped: boolean;
}

const SCRIPT_NAME = 'SpellWatcher';

// ============================================================================
// КОНСТАНТЫ (КОНФИГУРАЦИЯ)
// ============================================================================

/** Максимальное время блокировки WaitJournal за один тик (мс). */
const JOURNAL_WAIT_TIMEOUT_MS = 800;

/** Микропауза между тиками главного цикла (мс). */
const LOOP_TICK_MS = 50;

/** Сколько ждать тишины (без новых мантр) перед возвратом к дефолтному набору (мс). */
const IDLE_RESET_TIMEOUT_MS = 10000;

/** Цвет каста в журнале */
const MANTRA_MESSAGE_COLOR = '0x03B2';

/** Шкуры по школам магии.*/
const SCHOOL_SKINS: Record<MagicSchool, ItemDef> = {
  nature: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0A93' },
  fire: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0A61' },
  mind: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0BA2' },
  dark: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0B73' },
  light: { graphic: toGraphic('0x1F03|0x1515'), color: '0x0001' },
};

// Паттерн для Orion.WaitJournal — все мантры через "|".
const MANTRA_PATTERN = SPELLS.map((s) => s.mantra).join('|');

// Спеллы, отсортированные по длине мантры DESC — защита от префиксных коллизий
// (напр. "An Ort" vs "Vas An Ort"): длинная совпадёт первой.
const SPELL_DATA_BY_LEN = SPELLS.slice().sort(
  (a, b) => b.mantra.length - a.mantra.length,
);

// ============================================================================
// ФУНКЦИИ
// ============================================================================

/** Резолвит школу магии из текста журнальной строки (устойчиво к коллизиям). */
function resolveSchoolFromMessage(text: string): SpellDef | null {
  for (const spell of SPELL_DATA_BY_LEN) {
    if (text.indexOf(spell.mantra) !== -1) {
      return spell;
    }
  }
  return null;
}

/** Проверяет, надета ли указанная шкура */
function isSkinEquipped(serial: Serial | null): boolean {
  if (!serial) return false;
  const obj = Orion.FindObject(serial);
  if (!obj) return false;
  return obj.Container() === Player.Serial();
}

/** Собирает графики всех возможных шкур из SCHOOL_SKINS в единый паттерн. */
function getAllSkinGraphics(): Graphic {
  const parts: string[] = [];
  const seen: Record<string, boolean> = {};
  for (const key in SCHOOL_SKINS) {
    const g = SCHOOL_SKINS[key as MagicSchool].graphic;
    for (const part of g.split('|')) {
      if (!seen[part]) {
        seen[part] = true;
        parts.push(part);
      }
    }
  }
  return toGraphic(parts.join('|'));
}

/** На старте запоминает серийники шкур, которые уже надеты на персонаже. */
function captureDefaultSkins(): Serial[] {
  const allGraphics = getAllSkinGraphics();
  const equipped = Orion.FindType(
    allGraphics,
    'any',
    Player.Serial(),
    '',
    '',
    '',
    false,
  );
  return equipped || [];
}

/** Возвращает надетый по умолчанию набор шкур. */
function equipDefaultSkins(state: WatcherState): void {
  if (state.isDefaultEquipped) return;

  if (state.defaultSkinSerials.length === 0) {
    state.isDefaultEquipped = true;
    state.currentSchool = null;
    state.currentSkinSerial = null;
    return;
  }

  for (const serial of state.defaultSkinSerials) {
    Orion.UseObject(serial);
  }

  state.isDefaultEquipped = true;
  state.currentSchool = null;
  state.currentSkinSerial = null;
  Orion.Print(`[${SCRIPT_NAME}] Возврат к дефолтному набору шкур`);
}

/** Надевает шкуру нужной школы из рюкзака. */
function equipSkin(school: MagicSchool, state: WatcherState): void {
  // Уже надета нужная шкура — ничего не делаем.
  if (
    state.currentSchool === school &&
    isSkinEquipped(state.currentSkinSerial)
  ) {
    return;
  }

  const skin = SCHOOL_SKINS[school];
  const foundSkins = Orion.FindType(
    skin.graphic,
    skin.color,
    'backpack',
    '',
    '',
    '',
    true,
  );

  if (!foundSkins || foundSkins.length === 0) {
    Orion.Print(`[${SCRIPT_NAME}] Шкура школы ${school} не найдена в рюкзаке`);
    return;
  }

  const serial = foundSkins[0];

  for (const skin of foundSkins) {
    Orion.UseObject(skin);
  }

  state.currentSchool = school;
  state.currentSkinSerial = serial;
  state.isDefaultEquipped = false;
}

// ============================================================================
// ТОЧКИ ВХОДА
// ============================================================================

export function SpellWatcher(): void {
  Orion.Print(`[${SCRIPT_NAME}] Запуск отслеживания вражеских кастов`);

  const defaultSkinSerials = captureDefaultSkins();
  Orion.Print(
    `[${SCRIPT_NAME}] Дефолтных шкур зафиксировано: ${defaultSkinSerials.length}`,
  );

  const state: WatcherState = {
    currentSchool: null,
    currentSkinSerial: null,
    defaultSkinSerials,
    isDefaultEquipped: true,
  };

  Orion.ClearJournal();
  let lastCheck = Orion.Now();
  let lastCastTime = Orion.Now();

  while (!Player.Dead()) {
    const now = Orion.Now();
    const msg = Orion.WaitJournal(
      MANTRA_PATTERN,
      lastCheck,
      now + JOURNAL_WAIT_TIMEOUT_MS,
      'ignoreself|ignorefriends',
      '0',
      MANTRA_MESSAGE_COLOR,
    );

    if (msg) {
      lastCheck = now + JOURNAL_WAIT_TIMEOUT_MS;
      const spell = resolveSchoolFromMessage(msg.Text());
      if (spell) {
        lastCastTime = Orion.Now();
        equipSkin(spell.school, state);
        Orion.Print(
          `[${SCRIPT_NAME}] ${spell.school}: ${spell.mantra} (${spell.name}) → шкура надета`,
        );
      }
    } else {
      lastCheck = now;
    }

    // Возврат к дефолтному набору после тишины.
    if (
      !state.isDefaultEquipped &&
      Orion.Now() - lastCastTime >= IDLE_RESET_TIMEOUT_MS
    ) {
      equipDefaultSkins(state);
    }

    Orion.Wait(LOOP_TICK_MS);
  }

  Orion.Print(`[${SCRIPT_NAME}] Остановлен`);
}

export function StopSpellWatcher(): void {
  Orion.Terminate('SpellWatcher');
  Orion.Print(`[${SCRIPT_NAME}] Завершение по запросу`);
}
