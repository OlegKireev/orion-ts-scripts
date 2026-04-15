import { moveItem } from '@lib/helpers';
import { toGraphic, toSerial } from '@lib/validators';

// --------------------
// Конфигурация
// --------------------
const CONFIG = {
  CHEST: toSerial('0x4038539F'), // Контейнер с регами
  REAGENTS_BAG: toSerial('0x4038539F'), // Сумка внутри контейнера с регами
  MINIMUM_REAGENT_COUNT: 5, // Минимальное количество регов в паке
  PEACE_TIMEOUT: 60000, // Макс. время ожидания (в мс) "You are at peace"
};

const REAGENTS = {
  SpiderSilk: toGraphic('0x0F8D'),
  SulfurousAsh: toGraphic('0x0F8C'),
  Garlic: toGraphic('0x0F84'),
  Ginseng: toGraphic('0x0F85'),
};

export function Magery() {
  Orion.UseObject(CONFIG.CHEST);
  Orion.Wait(200);
  Orion.UseObject(CONFIG.REAGENTS_BAG);
  Orion.Wait(200);

  const reagentsList = [
    REAGENTS.SpiderSilk,
    REAGENTS.SulfurousAsh,
    REAGENTS.Garlic,
    REAGENTS.Ginseng,
  ];

  while (true) {
    if (Player.WarMode()) {
      Orion.WarMode(0);
      Orion.Wait(200);
    }

    Orion.ClearJournal();

    restockReagents(reagentsList);

    const hasNightSight = hasEnoughReagents(
      REAGENTS.SpiderSilk,
      REAGENTS.SulfurousAsh,
    );
    const hasCure = hasEnoughReagents(REAGENTS.Garlic, REAGENTS.Ginseng);

    let spell = '';
    let mana = 0;
    let delay = 0;

    // 2. Выбираем, что кастовать
    if (hasNightSight) {
      spell = 'Night Sight';
      mana = 4;
      delay = 1500;
    } else if (hasCure) {
      spell = 'Cure';
      mana = 4;
      delay = 1500;
    } else {
      Orion.Print('Не хватает регов, ждём пополнения...');
      Orion.Wait(5000);
      continue;
    }

    // 3. Кастуем или медитируем
    if (Player.Mana() === Player.MaxMana()) {
      Orion.Cast(spell, 'self');
      Orion.Wait(delay); // Ждем откат скилла и идем на новый круг цикла
    } else {
      meditateToFull(); // Маны нет — уходим в медитацию
    }
  }
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

function hasEnoughReagents(reg1: Graphic, reg2: Graphic): boolean {
  return (
    Orion.Count(reg1, 'any', 'backpack') >= CONFIG.MINIMUM_REAGENT_COUNT &&
    Orion.Count(reg2, 'any', 'backpack') >= CONFIG.MINIMUM_REAGENT_COUNT
  );
}

function restockReagents(reagents: Graphic[]) {
  for (const reg of reagents) {
    const countInBackpack = Orion.Count(reg, 'any', 'backpack');

    if (countInBackpack < CONFIG.MINIMUM_REAGENT_COUNT) {
      let needed = CONFIG.MINIMUM_REAGENT_COUNT - countInBackpack;
      const itemsInBag = Orion.FindType(reg, 'any', CONFIG.REAGENTS_BAG);

      for (let i = 0; i < itemsInBag.length && needed > 0; i++) {
        moveItem(itemsInBag[i], needed, 'backpack');
        needed =
          CONFIG.MINIMUM_REAGENT_COUNT - Orion.Count(reg, 'any', 'backpack'); // Перепроверяем
      }
    }
  }
}

/** Медитирует до полного столба маны */
function meditateToFull() {
  while (Player.Mana() < Player.MaxMana()) {
    Orion.ClearJournal();
    Orion.UseSkill('Meditation');

    // Запускаем внутренний таймер ожидания (чтобы не зависнуть навсегда)
    const timeEnd = Orion.Now() + 12000;

    while (Orion.Now() < timeEnd) {
      // Если медитация прошла успешно и мы достигли "мира"
      if (Orion.InJournal('You are at peace')) {
        Orion.Wait(500); // Небольшая пауза для стабильности
        return; // Выходим из функции, возвращаемся к кастам
      }

      // Если сбили концентрацию — прерываем ожидание и юзаем скилл заново
      if (Orion.InJournal('You lose your concentration')) {
        Orion.Wait(500);
        break; // Выход из внутреннего цикла `while`, чтобы снова нажать Meditation
      }

      Orion.Wait(100);
    }
  }
}
