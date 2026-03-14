import { toGraphic } from '@lib/validators';

// Графика трупа (corpse) в Ultima Online
const CORPSE_GRAPHIC = toGraphic('0x2006');

// TODO: Впиши сюда координаты тайла рядом с хилером или крестом
const RES_X = 1234;
const RES_Y = 5678;

// Обязательно экспортируем функцию, чтобы Orion ее увидел
export function AutoResurrect() {
  Orion.Print('[AutoRes] Скрипт авто-воскрешения запущен...');

  while (true) {
    if (Player.Dead()) {
      handleDeathSequence();
    }
    // Проверяем статус раз в секунду, чтобы не грузить клиент
    Orion.Wait(1000);
  }
}

function handleDeathSequence() {
  Orion.Print('[AutoRes] 💀 Персонаж мертв. Начинаем спасательную операцию...');

  // 1. Собираем все ЗАПУЩЕННЫЕ скрипты с помощью правильного метода
  const runningScripts = Orion.GetScripts('started');
  const pausedScripts: string[] = [];

  for (const scriptName of runningScripts) {
    // Не ставим на паузу сами себя
    if (scriptName !== 'AutoResurrect') {
      Orion.PauseScript(scriptName);
      pausedScripts.push(scriptName);
    }
  }

  // 2. Запоминаем точные координаты места смерти
  const deathX = Player.X();
  const deathY = Player.Y();
  const deathZ = Player.Z();

  // 3. Бежим к координатам воскрешения
  Orion.Print('[AutoRes] 🏃 Бежим воскрешаться...');
  Orion.WalkTo(RES_X, RES_Y, Player.Z(), 1, 255, true, true);

  // 4. Ждем, пока персонаж не станет живым
  // while (Player.Dead()) {
  // Раскомментируй нужный вариант воскрешения для твоего шарда:
  // Orion.Say('res');

  // const ankhs = Orion.FindType('0x1D97|0x1D98', 'any', 'ground', 'fast', 2);
  // if (ankhs.length > 0) Orion.UseObject(ankhs[0]);

  // Orion.Wait(2000);
  // }

  Orion.Print('[AutoRes] ✨ Воскресли! Возвращаемся за лутом...');

  // 5. Бежим обратно к месту смерти
  Orion.WalkTo(deathX, deathY, deathZ, 1, 255, true, true);

  // 6. Ищем свой труп и лутаем всё содержимое (в радиусе 3 тайлов)
  const corpses = Orion.FindType(CORPSE_GRAPHIC, 'any', 'ground', 'fast', 3);

  if (corpses.length > 0) {
    const myCorpse = corpses[0];
    Orion.UseObject(myCorpse);
    Orion.Wait(600);

    const itemsInCorpse = Orion.FindType('any', 'any', myCorpse);
    for (const item of itemsInCorpse) {
      Orion.MoveItem(item, 0, 'backpack');
      Orion.Wait(600);
    }
    Orion.Print('[AutoRes] 🎒 Труп успешно залутан!');
  } else {
    Orion.Print('[AutoRes] ❌ Труп не найден :(');
  }

  // 7. Снимаем с паузы все ранее остановленные скрипты
  Orion.Print('[AutoRes] ▶️ Возобновляем работу макросов...');
  for (const scriptName of pausedScripts) {
    Orion.ResumeScript(scriptName);
  }
}
