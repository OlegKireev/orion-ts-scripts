export function tracking(menuItem: string) {
  Orion.WaitMenu('Tracking', menuItem);
  Orion.UseSkill('Tracking');
  Orion.Wait(100);
}