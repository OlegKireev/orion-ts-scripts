declare interface CustomGumpObject {
  SetNoClose(state: boolean): void;
  SetNoMove(state: boolean): void;
  Clear(): void;
  SetX(x: number): void;
  SetY(y: number): void;
  SetCloseOnButtonClick(state: boolean): void;
  SetCallback(functionName: string): void;
  AddResizepic(
    x: number,
    y: number,
    graphic: Graphic | string,
    width: number,
    height: number,
  ): void;
  AddText(x: number, y: number, color: number, text: string): void;
  AddButton(
    buttonID: number,
    x: number,
    y: number,
    normalGraphic: Graphic | string,
    pressedGraphic: Graphic | string,
    disabledGraphic: Graphic | string,
    type: number,
  ): void;
  AddTilePic(
    x: number,
    y: number,
    graphic: Graphic | string,
    color: number,
    buttonID: number,
    backgroundGraphic: Graphic | string,
  ): void;
  Update(): void;
}

declare namespace CustomGumpResponse {
  /** Возвращает ID нажатой кнопки (Return Code) */
  function ReturnCode(): number;
  /** Возвращает серийник гампа */
  function Serial(): number;
}
