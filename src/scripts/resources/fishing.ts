import { toGraphic, toSerial } from '@/lib/validators';

var POLE_TYPE = toGraphic('0x0dbf'); // удочка
var FISH_GRAPHIC = toGraphic('0x0dd8|0x0dd9|0x0dd6|0x0dd7'); // типы рыбы (без стейков)
var DAGGER_GRAPHIC = toGraphic('0x0f51|0x0f52'); // кинжалы для разделки
var STEAK_GRAPHIC = toGraphic('0x097a'); // стейки после разделки
var BLACK_PEARL_GRAPHIC = toGraphic('0x0f7a'); // Black Pearls
var TRUNK_SERIAL = toSerial('0x40649840'); // трюм
var BAG_IN_TRUNK = toSerial('0x4036c020'); // сумка внутри трюма

var SUCCESS_MESSAGE = 'You pull out|You fish up';
var FISH_RESULT_MESSAGE = 'fish|fail|nothing|skill is to low|Try';
var MOVE_DURATION = 20000; // 20 секунд движение
var MOVES = ['Right', 'Right', 'Right', 'Left'];

// формируем тайлы 7x7 вокруг персонажа
var TILES: [number, number][] = [];
for (var dx = -3; dx <= 3; dx++) {
  for (var dy = -3; dy <= 3; dy++) {
    TILES.push([dx, dy]);
  }
}

function pickupFromGround(graphic: Graphic): void {
  var items = Orion.FindType(graphic, 'any', 'ground');
  for (var i = 0; i < items.length; i++) {
    var obj = Orion.FindObject(items[i]);
    if (obj && !obj.Locked()) {
      Orion.MoveItem(items[i], 0, 'backpack');
      Orion.Wait(200);
    }
  }
}

function storeToTrunk(graphic: Graphic): void {
  var items = Orion.FindType(graphic, 'any', 'backpack');
  for (var i = 0; i < items.length; i++) {
    Orion.MoveItem(items[i], 0, BAG_IN_TRUNK);
    Orion.Wait(200);
  }
}

function cutFish(): void {
  var fishes = Orion.FindType(FISH_GRAPHIC, 'any', 'backpack');
  for (var i = 0; i < fishes.length; i++) {
    var daggers = Orion.FindType(DAGGER_GRAPHIC, 'any', 'self');
    if (!daggers.length) {
      Orion.Print('Нет кинжала для разделки!');
      return;
    }
    Orion.UseObject(daggers[0]);
    Orion.WaitForTarget(2000);
    Orion.TargetObject(fishes[i]);
    Orion.Wait(300);
  }
}

function fishTiles(): void {
  for (var t = 0; t < TILES.length; t++) {
    // Проверяем удочку перед каждым тайлом
    var rods = Orion.FindType(POLE_TYPE, 'any', 'self');
    if (!rods.length) {
      Orion.Print('Нет удочки! Ждём 5 секунд...');
      Orion.Wait(5000);
      return;
    }

    var keepFishing = true;
    while (keepFishing) {
      Orion.CancelWaitTarget();
      Orion.UseObject(rods[0]);
      if (Orion.WaitForTarget(2000)) {
        Orion.TargetTileRelative('any', TILES[t][0], TILES[t][1], 0);
      }

      var start = Orion.Now();
      Orion.WaitJournal(FISH_RESULT_MESSAGE, start, start + 5000, 'any');
      Orion.Wait(1000);

      if (Orion.InJournal(SUCCESS_MESSAGE, 'my|sys', 0, 'any', start)) {
        Orion.Print(
          'Рыба поймана на тайле [' + TILES[t][0] + ',' + TILES[t][1] + ']',
        );
      } else {
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
  var trunkObj = Orion.FindObject(TRUNK_SERIAL);
  if (!trunkObj) return;

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
    for (var i = 0; i < MOVES.length; i++) {
      var command = MOVES[i];
      var duration = command === 'Left' ? MOVE_DURATION * 3 : MOVE_DURATION;

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
