declare interface FindListItem {
  Count: () => number;
  Graphic: () => Graphic;
  Color: () => string;
  Comment: () => string;
}

declare interface FindList {
  Items: () => FindListItem[];
  Name: () => string;
}
