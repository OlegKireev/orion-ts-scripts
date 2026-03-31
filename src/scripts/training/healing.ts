export function HealingHungry() {
  const endMesage = 'sucessfully bandage|bandage barely';
  const HEAL_TIMEOUT = 6000;

  while (true) {
    if (Player.Hits() === Player.MaxHits()) {
      Orion.UseSkill('Evaluating Intelligence', 'self');
      Orion.Wait(2500);
    }

    if (Player.Hits() < Player.MaxHits()) {
      const start = Orion.Now();
      Orion.Say('.bs');
      Orion.WaitJournal(endMesage, start, start + HEAL_TIMEOUT, 'sys|my');
      Orion.Wait(100);
    }
  }
}
