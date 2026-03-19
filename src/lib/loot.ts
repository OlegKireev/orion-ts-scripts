import { toGraphic } from '@lib/validators';

/**
 * Базовая функция для лута трупов
 * @param itemLists Массив названий списков (из вкладки Lists -> Find)
 */
export function loot(itemLists: string[]): void {
  const LOOT_RANGE = 3;
  const DELAY = 1;
  const CORPSE_GRAPHIC = toGraphic('0x2006');

  Orion.Print('Поиск трупов...');

  const corpses = Orion.FindType(
    CORPSE_GRAPHIC,
    'any',
    'ground',
    '',
    LOOT_RANGE,
  );

  if (!corpses || !corpses.length) {
    Orion.Print('Трупы не найдены');
    return;
  }

  Orion.Print(`Найдено трупов: ${corpses.length}`);

  for (const corpseId of corpses) {
    Orion.UseObject(corpseId);
    Orion.Wait(DELAY);

    const items = Orion.FindList(itemLists.join('|'), corpseId);

    if (!items || !items.length) {
      Orion.Print('Предметы не найдены');
      continue;
    }

    Orion.Print(`Найдено предметов: ${items.length}`);

    for (const itemId of items) {
      Orion.MoveItem(itemId, 0, 'backpack');

      Orion.Wait(DELAY);
    }

    Orion.Ignore(corpseId);
    Orion.Wait(DELAY);
  }
}
