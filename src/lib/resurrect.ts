import { toGraphic } from '@lib/validators';
import { sendTelegramMessage } from './telegram';
import { ITEM_MOVE_DELAY } from '@/constants';

const CORPSE_GRAPHIC = toGraphic('0x2006');
const RESURRECT_COORDS = {
  x: 970,
  y: 1769,
};
const PATROL_OFFSETS = [
  { dx: 0, dy: 0 }, // Центр
  { dx: 1, dy: 0 }, // Восток
  { dx: 0, dy: 1 }, // Юг
  { dx: -1, dy: 0 }, // Запад
  { dx: 0, dy: -1 }, // Север
  { dx: 1, dy: 1 }, // Юго-Восток
  { dx: -1, dy: -1 }, // Северо-Запад
  { dx: 1, dy: -1 }, // Северо-Восток
  { dx: -1, dy: 1 }, // Юго-Запад
];

export function Resurrect() {
  Orion.Print('[Resurrect] Скрипт авто-воскрешения запущен...');

  while (true) {
    if (Player.Dead()) {
      handleDeathSequence();
    }
    Orion.Wait(1000);
  }
}

function handleDeathSequence() {
  Orion.Print(
    '[Resurrect] 💀 Персонаж мертв. Начинаем спасательную операцию...',
  );

  sendTelegramMessage(`${Player.Name()}: Умер [${Orion.Time('hh:mm:ss')}]`);

  const runningScripts = Orion.GetScripts('started');
  const pausedScripts: string[] = [];

  for (const scriptName of runningScripts) {
    if (scriptName !== 'Resurrect') {
      Orion.PauseScript(scriptName);
      pausedScripts.push(scriptName);
    }
  }

  const deathX = Player.X();
  const deathY = Player.Y();
  const deathZ = Player.Z();

  Orion.Print('[Resurrect] 🏃 Бежим воскрешаться...');
  Orion.WalkTo(
    RESURRECT_COORDS.x,
    RESURRECT_COORDS.y,
    Player.Z(),
    0,
    255,
    true,
    true,
  );

  while (Player.Dead()) {
    for (const offset of PATROL_OFFSETS) {
      if (!Player.Dead()) {
        break;
      }

      const targetX = RESURRECT_COORDS.x + offset.dx;
      const targetY = RESURRECT_COORDS.y + offset.dy;

      Orion.WalkTo(targetX, targetY, Player.Z(), 0, 255, true, true);

      Orion.Wait(300);
    }
  }

  Orion.Print('[Resurrect] ✨ Воскресли! Возвращаемся за лутом...');

  Orion.WalkTo(deathX, deathY, deathZ, 0, 255, true, true);

  const corpses = Orion.FindType(CORPSE_GRAPHIC, 'any', 'ground', 'fast', 3);

  if (corpses.length > 0) {
    const myCorpse = corpses[0];
    Orion.UseObject(myCorpse);
    Orion.Wait(600);

    const itemsInCorpse = Orion.FindType('any', 'any', myCorpse);
    for (const item of itemsInCorpse) {
      Orion.MoveItem(item, 0, 'backpack');
      Orion.Wait(ITEM_MOVE_DELAY);
    }
    Orion.Print('[Resurrect] 🎒 Труп успешно залутан!');
  } else {
    Orion.Print('[Resurrect] ❌ Труп не найден :(');
  }

  Orion.Print('[Resurrect] ▶️ Возобновляем работу макросов...');
  for (const scriptName of pausedScripts) {
    Orion.ResumeScript(scriptName);
  }
}
