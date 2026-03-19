export function tracking(menuItem: string) {
  Orion.UseSkill('Tracking');
	if (Orion.WaitForMenu(100)) {
		var menu = Orion.GetMenu('last');
		if (menu !== null) {
			if (menu.Name() === "Tracking")
				menu.Select(menuItem);
		}
	}
}