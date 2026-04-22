export { Eating } from '@/lib/eating';

export function DetectHidden() {
  Orion.Exec('Eating');
  while (true) {
    Orion.WarMode(0);
    Orion.UseSkill('Detecting Hidden');
    Orion.Wait(2500);
  }
}

export function DetectHiddenBot() {
  while (true) {
    if (!Player.Hidden()) {
      Orion.WarMode(0);
      Orion.UseSkill('Hiding');
      Orion.Wait(6000);
    }
  }
}
