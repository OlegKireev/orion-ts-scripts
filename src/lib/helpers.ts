const LAG_DELAY = 60000;

export function checkLag(): void {
  const start = Orion.Now();
  Orion.Click('backpack');
  Orion.WaitJournal('', start, start + LAG_DELAY, 'any');
  Orion.Wait(1);
}

export function stopBot(exclusion: string = ''): void {
  if (Orion.IsWalking()) {
    Orion.StopWalking();
  }

  Orion.StopMacro();
  Orion.BlockMoving(false);
  Orion.OptionAlwaysRun(false);
  Orion.ResetIgnoreList();
  Orion.CancelWaitGump();
  Orion.CancelWaitMenu();
  Orion.CancelWaitTarget();
  Orion.ClearTimers();
  Orion.Terminate('all', exclusion);
}
