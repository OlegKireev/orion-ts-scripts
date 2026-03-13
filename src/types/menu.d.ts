declare interface ClassicMenu {
  /** Возвращает заголовок меню */
  Name(): string;
  /** Выбирает пункт меню по его названию или индексу*/
  Select(itemName: string | number): void;
  /** Закрывает меню */
  Close(): void;
  /** Возвращает серийник выбранного пункта меню */
  Serial(): Serial;
}
