export function tracking(menuItem: string) {
  Orion.WarMode(0);
  Orion.WaitMenu('Tracking', menuItem);
  Orion.UseSkill('Tracking');
  Orion.Wait(100);
}
