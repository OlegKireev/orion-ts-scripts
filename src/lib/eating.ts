import { toGraphic } from './validators';

export function Eating() {
  const FOOD_TYPE = toGraphic(
    '0x097B|0x09D0|0x09F2|0x09B7|0x097B|0x103B|0x097E|0x09B7|0x097A|0x160A|0x09F1|0x09C0|0x09EB|0x09D0|0x0994|0x09D2|0x09D1|0x0C5C|0x09E9|0x09B5',
  );

  while (!Player.Dead()) {
    Orion.UseType(FOOD_TYPE, 'any', 'backpack');

    if (
      Orion.WaitJournal(
        'hungry|satiated|but manage to eat the food| You feel quite|You are stuffed',
        Orion.Now(),
        Orion.Now() + 100000,
      )
    ) {
      Orion.Wait(200);
    }
    Orion.Wait(5000);
  }
}
