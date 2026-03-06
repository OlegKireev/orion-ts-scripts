import { GLOBAL_SERIALS, GLOBAL_GRAPHICS } from '../constants';

export function toSerial(val: string): Serial;
export function toSerial(val: string[]): Serial[];
export function toSerial(val: string | string[]): Serial | Serial[] {
  // Важно: в строках приходится использовать двойной слеш (\\) для экранирования!
  const SERIAL_REGEX = new RegExp(
    `^(${GLOBAL_SERIALS.join('|')}|!?0x[0-9a-fA-F]{8})$`,
    'i',
  );

  if (Array.isArray(val)) {
    return val.map((v) => toSerial(v)) as Serial[];
  }

  if (!SERIAL_REGEX.test(val)) {
    Orion.Print(`[ERROR] Неверный формат Serial: ${val}`);
  }
  return val as Serial;
}

export function toGraphic(val: string): Graphic;
export function toGraphic(val: string[]): Graphic[];
export function toGraphic(val: string | string[]): Graphic | Graphic[] {
  // Здесь мы экранируем пайп (\\|), чтобы регулярка воспринимала его как текст,
  // а не как оператор "или" между блоками hex-кодов
  const GRAPHIC_REGEX = new RegExp(
    `^(${GLOBAL_GRAPHICS.join('|')}|(!?0x[0-9a-fA-F]{4})(\\|!?0x[0-9a-fA-F]{4})*)$`,
    'i',
  );

  if (Array.isArray(val)) {
    return val.map((v) => toGraphic(v)) as Graphic[];
  }

  if (!GRAPHIC_REGEX.test(val)) {
    Orion.Print(`[ERROR] Неверный формат Graphic: ${val}`);
  }
  return val as Graphic;
}
