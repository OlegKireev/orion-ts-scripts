import { ITEM_MOVE_DELAY } from '@/constants';
import { checkLag } from '@/lib/helpers';
import { toGraphic, toSerial } from '@/lib/validators';

const POLE_TYPE = toGraphic('0x0dbf'); // удочка
const FISH_GRAPHIC = toGraphic('0x0dd8|0x0dd9|0x0dd6|0x0dd7'); // типы рыбы (без стейков)
const DAGGER_GRAPHIC = toGraphic('0x0f51|0x0f52'); // кинжалы для разделки
const STEAK_GRAPHIC = toGraphic('0x097a'); // стейки после разделки
const BLACK_PEARL_GRAPHIC = toGraphic('0x0f7a'); // Black Pearls
const TRUNK_SERIAL = toSerial('0x40649840'); // трюм
const BAG_IN_TRUNK = toSerial('0x4036c020'); // сумка внутри трюма

const KEEP_SAME_TILE_MESSAGES =
  'You fish a while|You pull out|You fish up|another action';
const FISH_RESULT_MESSAGE =
  'You fish a while|You pull out|You fish up|Try fishing|There are no fish|You cant do that|another action';
const MOVE_DURATION = 20000; // 20 секунд движение
const MOVES = ['Right', 'Right', 'Right', 'Left'];

// формируем тайлы 13x13 вокруг персонажа
const TILES: [number, number][] = [];
for (var dx = -6; dx <= 6; dx++) {
  for (var dy = -6; dy <= 6; dy++) {
    TILES.push([dx, dy]);
  }
}

export function Autostart(): void {
  Orion.Exec('Monitor', true);
  Orion.Exec('Fishing', true);
  checkLag();
  Orion.ResumeScript('all');
}

function pickupFromGround(graphic: Graphic): void {
  const items = Orion.FindType(graphic, 'any', 'ground');
  for (let i = 0; i < items.length; i++) {
    const object = Orion.FindObject(items[i]);
    if (object && !object.Locked()) {
      Orion.MoveItem(items[i], 0, 'backpack');
      Orion.Wait(ITEM_MOVE_DELAY);
    }
  }
}

function storeToTrunk(graphic: Graphic): void {
  const items = Orion.FindType(graphic, 'any', 'backpack');
  for (let i = 0; i < items.length; i++) {
    Orion.MoveItem(items[i], 0, BAG_IN_TRUNK);
    Orion.Wait(ITEM_MOVE_DELAY);
  }
}

function cutFish(): void {
  const fishes = Orion.FindType(FISH_GRAPHIC, 'any', 'backpack');

  const rightHandItem = Orion.ObjAtLayer('RightHand');
  const leftHandItem = Orion.ObjAtLayer('LeftHand');

  const rightHandSerial = rightHandItem ? rightHandItem.Serial() : null;
  const leftHandSerial = leftHandItem ? leftHandItem.Serial() : null;

  const daggers = Orion.FindType(DAGGER_GRAPHIC, 'any', 'backpack');
  if (!daggers || daggers.length === 0) {
    Orion.Print('Ошибка: Нож не найден в рюкзаке!');
    return;
  }
  const dagger = daggers[0];

  for (let i = 0; i < fishes.length; i++) {
    const fish = fishes[i];

    Orion.WaitTargetObject(fish);
    Orion.UseObject(dagger);
    Orion.Wait(100);
  }

  if (rightHandSerial) {
    Orion.UseObject(rightHandSerial);
    Orion.Wait(100);
  }
  if (leftHandSerial) {
    Orion.UseObject(leftHandSerial);
    Orion.Wait(100);
  }
}

function fishTiles(): void {
  for (let i = 0; i < TILES.length; i++) {
    // Проверяем удочку перед каждым тайлом
    const rods = Orion.FindType(POLE_TYPE, 'any', 'self');

    if (!rods.length) {
      Orion.Print('Нет удочки! Ждём 5 секунд...');
      Orion.Wait(5000);
      return;
    }

    const x = TILES[i][0];
    const y = TILES[i][1];

    let keepFishing = true;
    while (keepFishing) {
      Orion.CancelWaitTarget();
      checkLag();

      Orion.Print(`Ловлю в [${x}, ${y}]`);

      const start = Orion.Now();

      Orion.WaitTargetTileRelative('water', x, y, 0);
      Orion.UseObject(rods[0]);

      Orion.WaitJournal(FISH_RESULT_MESSAGE, start, start + 5000, 'any');

      if (Orion.InJournal(KEEP_SAME_TILE_MESSAGES, 'my|sys', 0, 'any', start)) {
        Orion.Print(`Продолжаю ловить [${x}, ${y}]`);
      } else {
        Orion.Print('Перехожу к следующему тайлу');
        pickupFromGround(FISH_GRAPHIC);
        Orion.Wait(2000);
        keepFishing = false;
      }
    }
  }
}

export function collectAndStoreLoot(): void {
  // Поднять рыбу с земли, разделать, поднять жемчуг
  pickupFromGround(FISH_GRAPHIC);
  cutFish();
  pickupFromGround(BLACK_PEARL_GRAPHIC);

  // Перенести в трюм
  const trunkObject = Orion.FindObject(TRUNK_SERIAL);
  if (!trunkObject) return;

  Orion.UseObject(TRUNK_SERIAL);
  Orion.Wait(500);
  Orion.UseObject(BAG_IN_TRUNK);
  Orion.Wait(500);

  storeToTrunk(STEAK_GRAPHIC);
  storeToTrunk(BLACK_PEARL_GRAPHIC);
}

export function Fishing(): void {
  Orion.Print('Начинаем рыбалку на стартовой позиции');
  fishTiles();

  while (true) {
    for (let i = 0; i < MOVES.length; i++) {
      const command = MOVES[i];
      const duration =
        command === 'Left' ? MOVE_DURATION * MOVES.length : MOVE_DURATION;

      Orion.Print('Плывём ' + command);
      Orion.Say(command);
      Orion.Wait(duration);
      Orion.Say('Stop');
      Orion.Print('Стоп, начинаем облов тайлов');
      collectAndStoreLoot();
      fishTiles();
    }
  }
}
