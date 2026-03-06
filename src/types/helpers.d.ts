type Color = string;

interface Point2D {
  x: number;
  y: number;
}

declare type OrionGlobalSerial =
  (typeof import('../constants').GLOBAL_SERIALS)[number];
declare type OrionGlobalGraphic =
  (typeof import('../constants').GLOBAL_GRAPHICS)[number];

declare type Serial =
  | OrionGlobalSerial
  | (string & { readonly __brand: 'Serial' });
declare type Graphic =
  | OrionGlobalGraphic
  | (string & { readonly __brand: 'Graphic' });
