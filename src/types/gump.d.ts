declare interface GumpHookObject {}

declare interface GumpObject {
  Replayed(): boolean;
  Select(hook: GumpHookObject): boolean;
}

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
    serial: number,
    x: number,
    y: number,
    graphic: Graphic,
    graphicHover: Graphic,
    graphicActive: Graphic,
    color: Graphic,
    /** 0 - переход на страницу, 1 - выбор в гампе (по умолчанию: 1) */
    action?: 0 | 1,
    /** Номер страницы для action=0 (по умолчанию: -1) */
    toPage?: number,
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
