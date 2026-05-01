import { teleportLogout } from './helpers';
import { sendTelegramMessage } from './telegram';
import { toGraphic, toSerial } from './validators';

function getCurrentTime(): string {
  return `[${Orion.Time('hh:mm:ss')}]`;
}

export function ObserveEnemies(action: 'wait-at-home'): void {
  while (true) {
    const agressiveCreatures = Orion.FindType(
      'any',
      'any',
      'ground',
      'live',
      18,
      'red',
    );

    const creatures: GameObject[] = [];
    for (const serial of agressiveCreatures) {
      const creature = Orion.FindObject(toSerial(serial));

      if (creature && creature.Name() !== Player.Name()) {
        creatures.push(creature);
      }
    }

    if (agressiveCreatures.length > 0) {
      sendTelegramMessage(
        `🐀 ${Player.Name()}: Найдены красные мобы или игроки: ${creatures.map((c) => c.Name()).join(', ')}`,
      );

      if (action === 'wait-at-home') {
        Orion.Print('Возвращаюсь домой для ожидания');
        const INSIDE_COORDS = { x: 890, y: 1877, z: 6 } satisfies Point2D;
        Orion.WalkTo(
          INSIDE_COORDS.x,
          INSIDE_COORDS.y,
          INSIDE_COORDS.z,
          0,
          255,
          1,
          1,
        );
        const WAITING_MINUTES = 5;
        const waitingTime = WAITING_MINUTES * 60 * 1000;
        Orion.Print(`Жду ${WAITING_MINUTES} минут...`);
        Orion.PauseScript('all', 'ObserveEnemies');
        Orion.Wait(waitingTime);
        Orion.ResumeScript('all');
      }

      Orion.Wait(10000);
    }

    Orion.Ignore(agressiveCreatures);
  }
}

export function ObservePillars() {
  const PILLAR_GRAPHIC = toGraphic('0x0ED4');
  const KNOWN_PILLARS = toSerial(['0x401EF113']);
  const seenPillars: Serial[] = KNOWN_PILLARS.slice();

  while (true) {
    const pillars = Orion.FindType(PILLAR_GRAPHIC, 'any', 'ground', '', 40);

    for (const pillarSerial of pillars) {
      if (seenPillars.indexOf(pillarSerial) === -1) {
        seenPillars.push(pillarSerial);
        sendTelegramMessage(
          `🚨 ${Player.Name()}: Появился столб! ${getCurrentTime()}`,
        );
        Orion.PlayWav('Alarm');
      }
    }
  }
}

export function ObserveDeath() {
  while (true) {
    const playerName = `${Player.Name()}`;
    if (playerName && Player.Hits() <= 0) {
      sendTelegramMessage(`☠️ ${playerName}: Умер! ${getCurrentTime()}`);
    }

    Orion.Wait(10000);
  }
}

export function ObserveAdmin() {
  let lastCheckTime = Orion.Now();

  while (true) {
    const currentTime = Orion.Now();
    const isAdminDetected = Boolean(
      Orion.WaitJournal(
        'Персонал сервера',
        lastCheckTime,
        currentTime + 5000,
        '',
        '0',
        'any',
      ),
    );

    if (isAdminDetected) {
      sendTelegramMessage(
        `🚨 ${Player.Name()}: Появился персонал сервера! ${getCurrentTime()}`,
      );
      Orion.PlayWav('Alarm');
      lastCheckTime = currentTime + 5000;
    } else {
      lastCheckTime = currentTime;
    }
  }
}

export function ObservePlayers(action?: 'logout') {
  const FRIENDS = toSerial([
    '0x003D13ED', // Sunrise
    '0x003D1254', // TaHkucT
    '0x003EC8CD', // React
    '0x003EAC3F', // Angular
    '0x003D096F', // BeKcaHa
    '0x00623E74', // Svelte
    '0x003EB2F6', // Vue
    '0x003B3EDB', // Logi
    '0x00396D32', // Ing
    '0x00232598', // JustBear
    '0x0038A848', // GAV
    '0x00585AB7', // LCF

    '0x003F0E14', // WanZan
    '0x003F0C05', // Beaver
    '0x001DED76', // Durin
    '0x0032DD44', // Postuh
  ]);

  const KILLERS = toSerial([
    '0x00143511', // Gainer
    '0x003C6BA1', // Bart
    '0x003E2D46', // Crusader
    '0x003F0B6C', // rOod
    '0x003BDD53', // Judy Doe
  ]);

  while (true) {
    Orion.Ignore(FRIENDS);

    const humansSerials = Orion.FindType(
      'any',
      'any',
      'ground',
      'human',
      18,
      'gray|orange|blue|green|red',
    );

    const humans: GameObject[] = [];

    for (const serial of humansSerials) {
      const human = Orion.FindObject(toSerial(serial));

      if (human && human.Name() !== Player.Name()) {
        if (KILLERS.indexOf(human.Serial()) !== -1) {
          sendTelegramMessage(
            `🤡 ${Player.Name()}: Пришел уебок ${human.Name()}! Пытаюсь улететь... ${getCurrentTime()}`,
          );

          if (action === 'logout') {
            teleportLogout();
          }
        }
        humans.push(human);
      }
    }

    if (humans.length > 0) {
      const enemyNames = humans.map((enemy) => enemy.Name()).join(', ');
      sendTelegramMessage(
        `🤨 ${Player.Name()}: Кто-то тут есть: ${enemyNames} ${getCurrentTime()}`,
      );
    }

    Orion.Ignore(humansSerials);
  }
}
