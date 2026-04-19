import { ITEM_MOVE_DELAY } from '@/constants';
import { moveItem } from '@lib/helpers';
import { toGraphic } from '@lib/validators';

/**
 * Базовая функция для лута трупов
 * @param itemLists Массив названий списков (из вкладки Lists -> Find)
 */
export function loot(itemLists: string[]): void {
  const LOOT_RANGE = 3;
  const CORPSE_GRAPHIC = toGraphic('0x2006');

  const itemsType = itemLists.join('|');

  function lootItems(items: Serial[], delay: number) {
    for (const itemId of items) {
      if (delay > 0) {
        moveItem(itemId, 0, 'backpack');
      } else {
        Orion.MoveItem(itemId, 0, 'backpack');
      }
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
    Orion.Wait(100);

    const items = Orion.FindList(itemsType, corpseId);

    if (!items || !items.length) {
      continue;
    }

    lootItems(items, ITEM_MOVE_DELAY);

    Orion.Ignore(corpseId);
  }

  const groundItems = Orion.FindList(itemsType, 'ground', '', LOOT_RANGE);

  if (groundItems.length) {
    lootItems(groundItems, 0);
  }
}

const CONFIG = {
  knifeGraphics: toGraphic('0x0F51|0x0F52|0x13F6|0x0EC4|0x0EC2'),
  easyKnifeGraphics: toGraphic('0x10E4'),
  bladedWeaponGraphics: toGraphic('0x0F4B|0x13FA|0x13B5'),
  corpseGraphic: toGraphic('0x2006'),
  radius: 3,
  carveDelay: 100,
  equipDelay: 100,
};

export function carveCorpse() {
  // 1. Проверяем, есть ли в левой руке bladed-оружие, которым можно резать
  const leftHandItem = Orion.ObjAtLayer('LeftHand');
  const rightHandItem = Orion.ObjAtLayer('RightHand');
  const canCarveWithWeapon =
    leftHandItem &&
    CONFIG.bladedWeaponGraphics.indexOf(leftHandItem.Graphic()) !== -1;
  const easyKnives = Orion.FindType(
    CONFIG.easyKnifeGraphics,
    'any',
    'backpack',
  );
  const hasEasyKnife = easyKnives.length > 0;

  let carveSerial: Serial;

  if (canCarveWithWeapon) {
    carveSerial = leftHandItem.Serial();
  } else if (hasEasyKnife) {
    carveSerial = easyKnives[0];
  } else {
    // Ищем нож в рюкзаке
    const knives = Orion.FindType(CONFIG.knifeGraphics, 'any', 'backpack');
    if (!knives || knives.length === 0) {
      Orion.Print('Ошибка: Нож не найден в рюкзаке!');
      return;
    }
    carveSerial = knives[0];
  }

  // 2. Запоминаем экипировку (нужно восстановить только если режем ножом)

  const rightHandSerial = rightHandItem ? rightHandItem.Serial() : null;
  const leftHandSerial = leftHandItem ? leftHandItem.Serial() : null;

  // 3. Ищем трупы на земле в заданном радиусе
  const corpses = Orion.FindType(
    CONFIG.corpseGraphic,
    'any',
    'ground',
    'item',
    CONFIG.radius,
  );

  if (!corpses || corpses.length === 0) {
    Orion.Print('Трупов рядом нет.');
    return;
  }

  // 4. Режем трупы
  for (let i = 0; i < corpses.length; i++) {
    const corpseSerial = corpses[i];

    Orion.WaitTargetObject(corpseSerial);
    Orion.UseObject(carveSerial);
    Orion.Wait(CONFIG.carveDelay);
  }

  // 5. Восстанавливаем экипировку (только если резали ножом из рюкзака)
  if (!canCarveWithWeapon) {
    if (rightHandSerial) {
      Orion.UseObject(rightHandSerial);
      Orion.Wait(CONFIG.equipDelay);
    }
    if (leftHandSerial) {
      Orion.UseObject(leftHandSerial);
      Orion.Wait(CONFIG.equipDelay);
    }
  }
}
