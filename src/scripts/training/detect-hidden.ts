export function DetectHiddenBot() {
  while (true) {
    if (!Player.Hidden()) {
      Orion.UseSkill('Hiding');
      Orion.Wait(6000);
    }
  }
}