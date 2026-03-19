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

const CONFIG = {
  knifeGraphics: toGraphic('0x0F51|0x0F52|0x13F6|0x0EC4|0x0EC2'),
  corpseGraphic: toGraphic('0x2006'),
  radius: 3,
  carveDelay: 100,
  lootDelay: 1,
  equipDelay: 100,
};

export function CarveAndLoot(itemLists: string[]) {
  Orion.Print('Запускаем резку и лут по списку...');
  const itemsType = itemLists.join('|');

  // 1. Запоминаем текущее оружие
  const rightHandItem = Orion.ObjAtLayer('RightHand');
  const leftHandItem = Orion.ObjAtLayer('LeftHand');

  const rightHandSerial = rightHandItem ? rightHandItem.Serial() : null;
  const leftHandSerial = leftHandItem ? leftHandItem.Serial() : null;

  // 2. Ищем нож в рюкзаке
  const knives = Orion.FindType(CONFIG.knifeGraphics, 'any', 'backpack');
  if (!knives || knives.length === 0) {
    Orion.Print('Ошибка: Нож не найден в рюкзаке!');
    return;
  }
  const knifeSerial = knives[0];

  // 3. Ищем трупы на земле в заданном радиусе
  const corpses = Orion.FindType(
    CONFIG.corpseGraphic,
    'any',
    'ground',
    'item',
    CONFIG.radius
  );

  if (!corpses || corpses.length === 0) {
    Orion.Print('Трупов рядом нет.');
    return;
  }

  // 4. Режем трупы
  for (let i = 0; i < corpses.length; i++) {
    const corpseSerial = corpses[i];

    Orion.WaitTargetObject(corpseSerial);
    Orion.UseObject(knifeSerial);
    Orion.Wait(CONFIG.carveDelay);
  }

  // 5. Одеваем старое оружие обратно
  if (rightHandSerial) {
    Orion.UseObject(rightHandSerial);
    Orion.Wait(CONFIG.equipDelay);
  }
  if (leftHandSerial) {
    Orion.UseObject(leftHandSerial);
    Orion.Wait(CONFIG.equipDelay);
  }

  // 6. Лутаем порезанные трупы используя список Find
  for (let i = 0; i < corpses.length; i++) {
    const corpseSerial = corpses[i];

    Orion.OpenContainer(corpseSerial);
    Orion.Wait(CONFIG.carveDelay);
    const itemsToLoot = Orion.FindList(itemsType, corpseSerial);

    if (itemsToLoot && itemsToLoot.length > 0) {
      for (let k = 0; k < itemsToLoot.length; k++) {
        Orion.MoveItem(itemsToLoot[k], 0, 'backpack');
        Orion.Wait(CONFIG.lootDelay);
      }
    }
  }
}
