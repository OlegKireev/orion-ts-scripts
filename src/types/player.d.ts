/**
 * Глобальный объект Player, содержащий информацию о вашем персонаже.
 */
declare namespace Player {
  /** Возвращает имя персонажа. */
  function Name(): string;
  /** Возвращает текущее количество жизней (HP). */
  function Hits(): number;
  /** Возвращает текущую координату Z (высоту) персонажа. */
  function Z(): number;
  /** Возвращает текущий вес в рюкзаке. */
  function Weight(): number;
  /** Возвращает максимально допустимый вес. */
  function MaxWeight(): number;
}
