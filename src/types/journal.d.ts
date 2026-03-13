declare interface JournalMessage {
  Text(): string;
  SetText(newText: string): void;
  FindTextID(): number;
}