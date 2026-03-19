function FindGraphic(graphic: Graphic, radius: number = 20) {
  Orion.Print('Поиска объекта ' + graphic);

  while (true) {
      var findList = Orion.FindType(graphic, 'any', 'ground', 'near|item', radius);

      if (findList.length > 0) {
          var objSerial = findList[0];
          var obj = Orion.FindObject(objSerial);

          if (obj) {
              Orion.CharPrint('self', 66, 'Нашел объект! Дистанция: ' + Orion.GetDistance(objSerial));
              Orion.PlayWav('alarm');
          }
      }
      Orion.Wait(1000);
  }
}