import { checkLag } from './helpers';

/**
 * Функция проверки и ухода в хайд
 */
export function hiding(): void {
  const HIDING_DELAY = 4000;

  if (Player.Hidden()) {
    return;
  }

  while (!Player.Hidden()) {
    const start = Orion.Now();
    checkLag();
    Orion.UseSkill('Hiding');

    while (!Player.Hidden() && Orion.Now() < start + HIDING_DELAY) {
      Orion.Wait(200);
      if (
        Orion.InJournal(
          "You can't seem to hide|stop trying to hide",
          'sys',
          0,
          'any',
          start,
        )
      ) {
        break;
      }
    }
  }
}
