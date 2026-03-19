import { toGraphic } from '@lib/validators';

/**
 * Базовая функция для лута трупов
 * @param itemLists Массив названий списков (из вкладки Lists -> Find)
 */
export function loot(itemLists: string[]): void {
  const LOOT_RANGE = 3;
  const DELAY = 1;
  const CORPSE_GRAPHIC = toGraphic('0x2006');

  const itemsType = itemLists.join('|');

  function lootItems(items: Serial[]) {
    for (const itemId of items) {
      Orion.MoveItem(itemId, 0, 'backpack');
      Orion.Wait(DELAY);
    }
  }

  const corpses = Orion.FindType(
    CORPSE_GRAPHIC,
    'any',
    'ground',
    '',
    LOOT_RANGE,
  );

  for (const corpseId of corpses) {
    Orion.UseObject(corpseId);
    Orion.Wait(DELAY);

    const items = Orion.FindList(itemsType, corpseId);

    if (!items || !items.length) {
      continue;
    }

    lootItems(items);

    Orion.Ignore(corpseId);
    Orion.Wait(DELAY);
  }

  const groundItems = Orion.FindList(itemsType, 'ground', '', LOOT_RANGE);

  if (groundItems.length) {
    lootItems(groundItems);
  }
}
