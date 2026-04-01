import { toGraphic, toSerial } from '@/lib/validators';

export function SimpleFishing() {
  var POLE_TYPE = toGraphic('0x0dbf'); // удочка
  var SUCCESS_MESSAGE = 'You pull out|You fish up'; // сообщения об успешной рыбалке
  var MOVE_DURATION = 20000; // 20 секунд движение Right

  // формируем тайлы 7x7 вокруг персонажа
  const tiles: [number, number][] = [];
  for (var dx = -3; dx <= 3; dx++) {
    for (var dy = -3; dy <= 3; dy++) {
      tiles.push([dx, dy]);
    }
  }

  // функция облова тайлов
  function fishTiles() {
    var rods = Orion.FindType(POLE_TYPE, 'any', 'self');
    if (!rods.length) {
      Orion.Print('Нет удочки! Ждём 5 секунд...');
      Orion.Wait(5000);
      return;
    }

    for (var t = 0; t < tiles.length; t++) {
      var keepFishing = true;
      while (keepFishing) {
        Orion.CancelWaitTarget();
        Orion.UseObject(rods[0]);
        if (Orion.WaitForTarget(2000)) {
          Orion.TargetTileRelative('any', tiles[t][0], tiles[t][1], 0);
        }

        var start = Orion.Now();
        // ждём событие рыбалки до 5 секунд
        while (
          !Orion.InJournal(
            'fish|fail|nothing|skill is to low|Try',
            'any',
            0,
            'any',
            start,
          )
        ) {
          Orion.Wait(1000);
          if (Orion.Now() - start > 5000) break;
        }

        Orion.Wait(1000);

        if (Orion.InJournal(SUCCESS_MESSAGE, 'my|sys', 0, 'any', start)) {
          Orion.Print(
            'Рыба поймана на тайле [' + tiles[t][0] + ',' + tiles[t][1] + ']',
          );
          keepFishing = true; // продолжаем ловить на этом тайле
        } else {
          keepFishing = false; // переходим к следующему тайлу
        }
      }
    }
  }

  Orion.Print('Начинаем рыбалку на стартовой позиции');
  fishTiles(); // первая облова

  // бесконечный цикл Right → Right → Right → Left
  while (true) {
    var moves = ['Right', 'Right', 'Right', 'Left'];
    for (var i = 0; i < moves.length; i++) {
      var command = moves[i];
      var duration = command === 'Left' ? MOVE_DURATION * 3 : MOVE_DURATION;

      Orion.Print('Плывём ' + command);
      Orion.Say(command);
      Orion.Wait(duration);
      Orion.Say('Stop');
      Orion.Print('Стоп, начинаем облова тайлов');
      pickupProcessAndStoreAllSteaksAndPearls();
      fishTiles();
    }
  }
}

var FISH_GRAPHICS = [
  toGraphic('0x0dd8'),
  toGraphic('0x0dd9'),
  toGraphic('0x0dd6'),
  toGraphic('0x0dd7'),
  toGraphic('0x097a'),
]; // типы рыбы и стейки
var DAGGER_GRAPHIC = [toGraphic('0x0f51'), toGraphic('0x0f52')]; // кинжалы для рыбы
var STEAK_GRAPHIC = toGraphic('0x097a'); // стейки после разделки
var TRUNK_SERIAL = toSerial('0x40649840'); // трюм
var BAG_IN_TRUNK = toSerial('0x4036c020'); // сумка внутри трюма
var BLACK_PEARL_GRAPHIC = toGraphic('0x0f7a'); // Black Pearls

export function pickupProcessAndStoreAllSteaksAndPearls() {
  // --- Поднять рыбу с пола и обработать кинжалом ---
  for (var i = 0; i < FISH_GRAPHICS.length; i++) {
    var fishes = Orion.FindType(FISH_GRAPHICS[i], 'any', 'ground');
    if (fishes && fishes.length) {
      for (var j = 0; j < fishes.length; j++) {
        var fishObj = Orion.FindObject(fishes[j]);
        if (fishObj && !fishObj.Locked()) {
          Orion.MoveItem(fishes[j], 0, 'backpack');
          Orion.Wait(200);
          Orion.Print('Поднята рыба: 0x' + FISH_GRAPHICS[i].toString());

          // --- Разделка рыбы кинжалом ---
          for (var k = 0; k < DAGGER_GRAPHIC.length; k++) {
            var dag = Orion.FindType(DAGGER_GRAPHIC[k], 'any', 'self');
            if (dag && dag.length) {
              Orion.UseObject(dag[0]);
              Orion.WaitForTarget(2000);
              Orion.TargetObject(fishes[j]);
              Orion.Wait(300);
              Orion.Print(
                'Обработана рыба кинжалом: 0x' +
                  DAGGER_GRAPHIC[k].toString(),
              );
              break;
            }
          }
        }
      }
    }
  }

  // --- Поднять Black Pearls с пола (не режем) ---
  var pearls = Orion.FindType(BLACK_PEARL_GRAPHIC, 'any', 'ground');
  if (pearls && pearls.length) {
    for (var p = 0; p < pearls.length; p++) {
      var pearlObj = Orion.FindObject(pearls[p]);
      if (pearlObj && !pearlObj.Locked()) {
        Orion.MoveItem(pearls[p], 0, 'backpack');
        Orion.Wait(200);
        Orion.Print(
          'Подняты Black Pearls: 0x' + BLACK_PEARL_GRAPHIC.toString(),
        );
      }
    }
  }

  // --- Перенос всех стейков и Black Pearls в сумку внутри трюма ---
  var bagObj = Orion.FindObject(TRUNK_SERIAL);
  if (bagObj) {
    // открываем трюм и сумку, если не найдена
    Orion.UseObject(TRUNK_SERIAL);
    Orion.Wait(500);
    Orion.UseObject(BAG_IN_TRUNK);
    Orion.Wait(500);
    // переносим стейки
    var steaks = Orion.FindType(STEAK_GRAPHIC, 'any', 'backpack');
    if (steaks && steaks.length) {
      for (var s = 0; s < steaks.length; s++) {
        Orion.MoveItem(steaks[s], 0, BAG_IN_TRUNK);
        Orion.Wait(200);
        Orion.Print('Перенесён стейк в сумку: 0x' + STEAK_GRAPHIC.toString());
      }
    }
    // переносим Black Pearls
    var pearlsInBag = Orion.FindType(BLACK_PEARL_GRAPHIC, 'any', 'backpack');
    if (pearlsInBag && pearlsInBag.length) {
      for (var pb = 0; pb < pearlsInBag.length; pb++) {
        Orion.MoveItem(pearlsInBag[pb], 0, BAG_IN_TRUNK);
        Orion.Wait(200);
        Orion.Print(
          'Перенесены Black Pearls в сумку: 0x' +
            BLACK_PEARL_GRAPHIC.toString(),
        );
      }
    }
  }
}
