export interface GumpWaitOptions {
  /** Максимум ждать gump в мс. По умолчанию 1000 */
  timeout?: number;
  /** true — ждать именно *новый* gump, а не уже открытый. По умолчанию false */
  waitNewGump?: boolean;
}

export function selectGumpButton(
  buttonId: number | 'cancel',
  options?: GumpWaitOptions,
): boolean;
export function selectGumpButton(
  buttonId: number | 'cancel',
  gumpSerial: Serial,
  gumpId: string,
  options?: GumpWaitOptions,
): boolean;
export function selectGumpButton(
  buttonId: number | 'cancel',
  arg2?: GumpWaitOptions | Serial,
  arg3?: string,
  arg4?: GumpWaitOptions,
): boolean {
  let options: GumpWaitOptions = {};
  let gump: GumpObject | null = null;

  if (typeof arg2 === 'string') {
    // вторая перегрузка: (buttonId, serial, id, options?)
    options = arg4 ?? {};
  } else {
    // первая перегрузка: (buttonId, options?)
    options = arg2 ?? {};
  }

  const timeout = options.timeout ?? 1000;
  const waitNewGump = options.waitNewGump ?? false;

  if (!Orion.WaitForGump(timeout, waitNewGump)) {
    return false;
  }

  if (typeof arg2 === 'string' && typeof arg3 === 'string') {
    gump = Orion.GetGump(arg2, arg3);
  } else {
    gump = Orion.GetGump('last');
  }

  if (!gump || gump.Replayed()) {
    return false;
  }

  const hook = Orion.CreateGumpHook(buttonId);
  if (!hook) {
    return false;
  }

  return gump.Select(hook);
}
