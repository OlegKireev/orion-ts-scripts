// Orion вызывает эту функцию без аргументов,
// а данные мы берем из глобального объекта CustomGumpResponse
export function getGumpResponse(): void {
  const btnId = CustomGumpResponse.ReturnCode();
  Shared.AddVar('gumpResponse', btnId);
}

export function markTiles(): void {
  Shared.AddVar('gumpResponse', 0);

  const indent = 7;
  const w = 250;
  const h = 180;
  const x =
    Orion.ClientOptionGet('GameWindowX') +
    Orion.ClientOptionGet('GameWindowWidth') -
    (w + indent);
  const y =
    Orion.ClientOptionGet('GameWindowY') +
    Orion.ClientOptionGet('GameWindowHeight') -
    (h + indent);

  const gump = Orion.CreateCustomGump(1);
  gump.SetNoClose(false);
  gump.SetNoMove(false);
  gump.Clear();
  gump.SetX(x);
  gump.SetY(y);
  gump.SetCloseOnButtonClick(true);
  gump.SetCallback('getGumpResponse');
  gump.AddResizepic(0, 0, '0x0BB8', w, h);
  gump.AddText(70, 18, 0, 'What to mark?');
  gump.AddText(51, 48, 0, 'Trees');
  gump.AddText(154, 48, 0, 'Rocks');
  gump.AddButton(0, 96, 134, '0x00F1', '0x00F2', '0x00F3', 0);
  gump.AddTilePic(50, 67, '0x0E58', 0, 1, '0x0035');
  gump.AddTilePic(152, 69, '0x177C', 0, 2, '0x0035');
  gump.Update();

  Orion.Wait(100);

  while (Orion.GumpExists('custom', 1)) {
    Orion.Wait(100);
  }

  Orion.Wait(100);

  const response = Shared.GetVar('gumpResponse');
  let targetType: string;
  let targetName: string;

  // Определяем, что именно мы собираемся кликать
  switch (response) {
    case 1:
      targetType = 'tree';
      targetName = 'дерево';
      break;
    case 2:
      targetType = 'mine';
      targetName = 'камень';
      break;
    default:
      Orion.Print('markTiles canceled');
      return;
  }

  const arr: Point2D[] = [];

  TextWindow.Clear();
  Orion.ClearFakeMapObjects();
  Orion.CharPrint('self', 1153, `Где ${targetName}? Нажми Esc если закончил!`);

  while (Orion.WaitForAddObject('temp', 600000)) {
    const tx = SelectedTile.X();
    const ty = SelectedTile.Y();
    const tz = SelectedTile.Z();

    // Проверяем валидность тайла именно для выбранного типа (дерево или камень)
    if (!Orion.ValidateTargetTile(targetType, tx, ty)) {
      Orion.CharPrint('self', 1153, `Это не ${targetName}!`);
      Orion.PlayWav('Alarm');
      continue;
    }

    // Современный способ проверить наличие дубликатов в массиве
    const isDuplicate = arr.some((tile) => tile.x === tx && tile.y === ty);
    if (isDuplicate) {
      Orion.CharPrint('self', 1153, 'Этот тайл уже есть в списке!');
      Orion.PlayWav('Alarm');
      continue;
    }

    // Если все ок - добавляем маркер на карту и в массив
    const graphic = SelectedTile.IsStaticTile()
      ? SelectedTile.Graphic()
      : '0x136C';
    Orion.AddFakeMapObject(arr.length + 1, graphic, '0x0491', tx, ty, tz);

    arr.push({ x: tx, y: ty });
    Orion.Print(`Добавлен тайл #${arr.length}`);
  }

  // Красиво форматируем и выводим массив
  if (arr.length > 0) {
    const lines: string[] = [];

    // Разбиваем вывод блоками по 10 элементов
    for (let i = 0; i < arr.length; i += 10) {
      const chunk = arr.slice(i, i + 10);
      const chunkString = chunk
        .map((p) => `{ x: ${p.x}, y: ${p.y} }`)
        .join(', ');
      lines.push(`  ${chunkString}`);
    }

    TextWindow.Print(`[\n${lines.join(',\n')}\n]`);
    TextWindow.Open();
    Orion.ClearFakeMapObjects();
  }

  Orion.Print('markTiles completed');
  Orion.PlayWav('Alarm');
}
