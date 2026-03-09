declare interface ClassicMenu {
  /** Возвращает заголовок меню */
  Name(): string;
  /** Выбирает пункт меню по его названию */
  Select(itemName: string): void;
  /** Закрывает меню */
  Close(): void;
}
