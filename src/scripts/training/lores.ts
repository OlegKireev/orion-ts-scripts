export function Anatomy(): void {
  const DELAY = 3000;
  Orion.Print('Начинаем прокачку: Anatomy...');

  while (true) {
    Orion.ClearJournal();
    Orion.WaitTargetObject('self');
    Orion.UseSkill('Anatomy');
    Orion.Wait(DELAY);
    Orion.CancelWaitTarget();
  }
}

export function AnimalLore(): void {
  const DELAY = 3000;
  Orion.Print('Начинаем прокачку: AnimalLore...');

  while (true) {
    Orion.ClearJournal();
    Orion.UseSkill('Animal Lore', 'self');
    Orion.Wait(DELAY);
    Orion.CancelWaitTarget();
  }
}

export function EvaluatingIntelligence(): void {
  const DELAY = 3000;
  Orion.Print('Начинаем прокачку: EvaluatingIntelligence...');

  while (true) {
    Orion.ClearJournal();
    Orion.UseSkill('Evaluating Intelligence', 'self');
    Orion.Wait(DELAY);
    Orion.CancelWaitTarget();
  }
}

export function Tracking(): void {
  const DELAY = 100;
  Orion.Print('Начинаем прокачку: Tracking...');

  while (true) {
    Orion.UseSkill('Tracking');

    if (Orion.WaitForMenu(1000)) {
      const menu = Orion.GetMenu('last');

      if (menu !== null && menu.Name() === 'Tracking') {
        menu.Select('Players');
        Orion.Wait(DELAY);
        menu.Close();
      }
    }
    Orion.Wait(DELAY);
  }
}
