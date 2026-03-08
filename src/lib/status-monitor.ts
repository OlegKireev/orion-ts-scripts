import { sendTelegramMessage } from './telegram';
import { toGraphic, toSerial } from './validators';

export function Monitor(): void {
  let lastCheckTime = Orion.Now();

  const friends = toSerial([
    '0x003D13ED', // Sunrise
    '0x003D1254', // TaHkucT
    '0x003EC8CD', // React
    '0x003EAC3F', // Angular
    '0x003D096F', // BeKcaHa
    '0x00623E74', // Svelte
    '0x003EB2F6', // Vue
    '0x003B3EDB', // Logi
    '0x00396D32', // Ing

    '0x003F0E14', // WanZan
    '0x003F0C05', // Beaver
    '0x001DED76', // Durin
    '0x0032DD44', // Postuh
  ]);

  const seenPillars: Serial[] = [];
  const PILLAR_GRAPHIC = toGraphic('0x0ED4');

  while (true) {
    const currentTime = Orion.Now();
    const journalLine = Orion.WaitJournal(
      'Персонал сервера',
      lastCheckTime,
      currentTime + 5000,
      '',
      '0',
      'any',
    );

    if (journalLine) {
      sendTelegramMessage(
        `Появился персонал сервера: [${Orion.Time('hh:mm:ss')}]`,
      );
      lastCheckTime = currentTime + 5000;
    } else {
      lastCheckTime = currentTime;
    }

    // ==========================================
    // 2. ПРОВЕРКА АДМИНСКИХ СТОЛБОВ
    // ==========================================
    // Ищем на земле столб в радиусе 30 тайлов
    const pillars = Orion.FindType(PILLAR_GRAPHIC, 'any', 'ground', '', 40);

    for (const pillarSerial of pillars) {
      // Если в нашем массиве памяти еще нет этого серийника
      if (seenPillars.indexOf(pillarSerial) === -1) {
        // 1. Запоминаем его, чтобы больше не спамить
        seenPillars.push(pillarSerial);
        sendTelegramMessage(
          `🚨[${Player.Name()}]: Появился столб [${Orion.Time('hh:mm:ss')}]`,
        );
        Orion.PlayWav('Alarm');
      }
    }

    if (Player.Hits() <= 0) {
      sendTelegramMessage(`${Player.Name()}: Умер [${Orion.Time('hh:mm:ss')}]`);
      Orion.PauseScript('all');
    }

    Orion.Ignore(friends);
    const humans = Orion.FindType(
      'any',
      'any',
      'ground',
      'human',
      18,
      'gray|orange|red|blue|green',
    );
    let enemyNames = '';

    for (const serial of humans) {
      const enemyObj = Orion.FindObject(toSerial(serial));
      if (enemyObj && enemyObj.Name() !== Player.Name()) {
        enemyNames += `${enemyObj.Name()} `;
      }
    }

    if (enemyNames.trim() !== '') {
      sendTelegramMessage(
        `${Player.Name()}: Кто-то тут есть: [${enemyNames.trim()}] [${Orion.Time('hh:mm:ss')}]`,
      );
      Orion.Wait(5000);
    }

    Orion.Ignore(humans);
    Orion.Wait(500);
  }
}
