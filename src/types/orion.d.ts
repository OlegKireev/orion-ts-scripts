/**
 * Глобальный объект Orion для взаимодействия с клиентом Ultima Online.
 */
declare namespace Orion {
  /**
   * Возвращает текущее время (timestamp) в миллисекундах от старта системы.
   * Идеально для таймеров.
   */
  function Now(): number;

  /**
   * Возвращает текущее время в заданном формате.
   * @param format Формат времени, например "hh:mm:ss"
   */
  function Time(format: string): string;

  /**
   * Приостанавливает выполнение текущего скрипта на указанное время.
   * @param delay Задержка в миллисекундах.
   */
  function Wait(delay: number): void;

  /**
   * Включает или выключает игнорирование регистра при поиске сообщений в журнале.
   */
  function JournalIgnoreCase(state: boolean): void;

  /**
   * Ожидает появление текста в журнале в заданном промежутке времени.
   * @param text Искомый текст.
   * @param startTime Время начала поиска (Orion.Now()).
   * @param endTime Время окончания поиска.
   * @param sender Имя отправителя (по умолчанию "any").
   * @param serial Серийник отправителя (по умолчанию "any" или "0").
   * @param color Цвет сообщения.
   * @returns Объект сообщения журнала или null/undefined, если текст не найден.
   */
  function WaitJournal(
    text: string,
    startTime: number,
    endTime: number,
    sender?: string,
    serial?: string,
    color?: string,
  ): any;

  /**
   * Проверяет, есть ли сообщение в журнале.
   * @param text Искомый текст (можно использовать | для нескольких вариантов).
   * @param sender Источник (например, "sys|my").
   * @param serial Серийник отправителя.
   * @param color Цвет сообщения.
   * @param startTime Время, начиная с которого искать (timestamp).
   * @returns Объект сообщения, если найдено, иначе null.
   */
  function InJournal(
    text: string,
    sender?: string,
    serial?: string | number,
    color?: string,
    startTime?: number,
  ): any;

  // ==========================================
  // ПЕРЕМЕЩЕНИЕ
  // ==========================================

  /** Проверяет, находится ли персонаж в движении. */
  function IsWalking(): boolean;

  /** Принудительно останавливает движение персонажа. */
  function StopWalking(): void;

  /**
   * Блокирует возможность передвижения клиента мышкой.
   */
  function BlockMoving(state: boolean): void;

  /** Включает или выключает опцию "Всегда бегать". */
  function OptionAlwaysRun(state: boolean): void;

  /**
   * Идет в указанные координаты.
   * @param x Координата X.
   * @param y Координата Y.
   * @param z Координата Z.
   * @param distance Допустимая дистанция до цели (0 - точно в клетку).
   * @param timeout Таймаут на шаг (обычно 255).
   * @param run Бежать ли (true) или идти шагом (false).
   * @param hidden Учитывать ли скрытность при движении.
   * @returns true, если успешно дошли, иначе false.
   */
  function WalkTo(
    x: number,
    y: number,
    z: number,
    distance: number,
    timeout: number,
    run: boolean,
    hidden?: boolean,
  ): boolean;

  /** Устанавливает клетку как непроходимую для поиска пути. */
  function SetBadLocation(x: number, y: number): void;

  /** Возвращает дистанцию от персонажа до указанных координат. */
  function GetDistance(x: number, y: number): number;

  // ==========================================
  // ВЗАИМОДЕЙСТВИЕ И ПОИСК
  // ==========================================

  /** Выполняет одиночный клик по объекту. */
  function Click(serial: Serial): void;

  /**
   * Ищет объекты по типу. Возвращает массив серийников найденных объектов.
   * @param graphic Графика (тип) объекта.
   * @param color Цвет (по умолчанию 'any').
   * @param container Контейнер, где искать (например, 'backpack', 'ground').
   * @param flags Флаги поиска (например, 'human', 'item').
   * @param distance Дистанция поиска (если на земле).
   * @param noto Цвет репутации (notoriety), например 'gray|red|blue'.
   */
  function FindType(
    type: Graphic,
    color?: string,
    container?: string,
    flags?: string,
    distance?: number | string,
    noto?: string,
  ): Serial[];

  /**
   * Находит конкретный объект по его серийнику и возвращает интерфейс GameObject.
   */
  function FindObject(serial: Serial): GameObject | null;

  /** Подсчитывает количество предметов указанного типа. */
  function Count(type: Graphic, color?: string, container?: Serial): number;

  /**
   * Использует предмет по его типу (графике).
   * @returns true, если предмет найден и использован.
   */
  function UseType(type: Graphic, color?: string): boolean;

  /** Использует объект (двойной клик) по его серийнику. */
  function UseObject(serial: Serial): void;

  /** Открывает контейнер по серийнику (аналог UseObject, но именно для контейнеров). */
  function OpenContainer(serial: Serial): void;

  /**
   * Перемещает предмет в контейнер.
   * @param serial Серийник предмета.
   * @param count Количество (0 - все).
   * @param container Серийник контейнера назначения.
   */
  function MoveItem(serial: Serial, count: number, container: Serial): void;

  /**
   * Ищет предмет по типу и перемещает его.
   * @returns true, если предмет был перемещен.
   */
  function MoveItemType(
    type: Graphic,
    color: string,
    container: Serial,
    count: number,
    toContainer: Serial,
  ): boolean;

  /** Бросает предмет под ноги. */
  function DropHere(serial: Serial): void;

  // ==========================================
  // ТАРГЕТЫ И ИГНОР-ЛИСТЫ
  // ==========================================

  /** Добавляет серийник (или массив) в лист игнорирования поиска. */
  function Ignore(serial: Serial | Serial[]): void;

  /** Сбрасывает лист игнорирования. */
  function ResetIgnoreList(): void;

  /** Отменяет ожидание таргета. */
  function CancelWaitTarget(): void;

  /** Отменяет ожидание гампа (меню). */
  function CancelWaitGump(): void;

  /** Отменяет ожидание классического меню. */
  function CancelWaitMenu(): void;

  /** Кидает появившийся прицел на указанный объект. */
  function WaitTargetObject(serial: Serial): void;

  /** Проверяет валидность тайла для использования инструментов (например, кирки). */
  function ValidateTargetTileRelative(
    type: string,
    x: number,
    y: number,
  ): boolean;

  /** Ожидает прицел и кликает по относительному тайлу. */
  function WaitTargetTileRelative(
    type: string,
    x: number,
    y: number,
    z: number,
  ): void;

  // ==========================================
  // УПРАВЛЕНИЕ СКРИПТАМИ
  // ==========================================

  /**
   * Запускает другой скрипт.
   * @param scriptName Имя функции для запуска.
   * @param oneScriptPerName Запретить запуск дубликатов этого скрипта.
   */
  function Exec(
    scriptName: string,
    oneScriptPerName?: boolean,
    args?: any[],
  ): void;

  /** Приостанавливает скрипт ("all" для всех, кроме текущего). */
  function PauseScript(scriptName: string): void;

  /** Возобновляет работу приостановленного скрипта. */
  function ResumeScript(scriptName: string): void;

  /** Останавливает все макросы в клиенте. */
  function StopMacro(): void;

  /** Сбрасывает все внутренние таймеры Orion. */
  function ClearTimers(): void;

  /**
   * Завершает работу скриптов.
   * @param scriptName Имя скрипта или "all".
   * @param exclusion Имя скрипта, который нужно исключить из остановки.
   */
  function Terminate(scriptName: string, exclusion?: string): void;

  /** Проверяет, запущен ли скрипт с указанным именем. */
  function ScriptRunning(scriptName: string): boolean;

  // ==========================================
  // ВЫВОД ИНФОРМАЦИИ И СЕТЬ
  // ==========================================

  /** Печатает системное сообщение в клиенте. */
  function Print(text: string): void;

  /**
   * Печатает текст над объектом (или персонажем).
   * @param serial Серийник объекта (или 'self').
   * @param color Цвет текста.
   * @param text Выводимый текст.
   */
  function CharPrint(serial: string, color: number, text: string): void;

  /** Проигрывает звуковой файл (wav) из папки Orion. */
  function PlayWav(filename: string): void;

  /**
   * Отправляет HTTP POST запрос.
   * @param url Адрес запроса.
   * @param params Параметры запроса в формате строки (x-www-form-urlencoded).
   */
  function HttpPost(url: string, params: string): void;

  function ClientOptionGet(optionName: string): number;

  function CreateCustomGump(serial: number): CustomGumpObject;

  function GumpExists(type: string, serial: number): boolean;

  function ClearFakeMapObjects(): void;

  function WaitForAddObject(targetName: string, timeout: number): boolean;

  function ValidateTargetTile(type: string, x: number, y: number): boolean;

  function AddFakeMapObject(
    serial: number,
    graphic: Graphic | string,
    color: string,
    x: number,
    y: number,
    z: number,
  ): void;
}
