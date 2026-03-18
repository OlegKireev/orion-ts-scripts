import { toGraphic, toSerial } from '@lib/validators';

// --------------------
// Конфигурация
// --------------------
const CONFIG = {
  CHEST: toSerial('0x403853AC'), // Контейнер с регами
  REAGENTS_BAG: toSerial('0x40387E89'), // Сумка внутри контейнера с регами
  MINIMUM_REAGENT_COUNT: 5, // Минимальное количество регов в паке
  PEACE_TIMEOUT: 60000, // Макс. время ожидания (в мс) "You are at peace"
};

const REAGENTS = {
  Nightshade: toGraphic('0x0F88'),
  SpiderSilk: toGraphic('0x0F8D'),
  SulfurousAsh: toGraphic('0x0F8C'),
  Garlic: toGraphic('0x0F84'),
  Ginseng: toGraphic('0x0F85'),
};

export function Magery() {
  // --------------------
  // Открываем сумки на старте
  // --------------------
  Orion.Say('bank');
  Orion.UseObject(CONFIG.CHEST);
  Orion.Wait(200);
  Orion.UseObject(CONFIG.REAGENTS_BAG);
  Orion.Wait(200);

  const reagentsList = [
    REAGENTS.Nightshade,
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

    if (hasNightSight) {
      tryCast('Night Sight', 4, 2000);
    } else if (hasCure) {
      tryCast('Cure', 4, 1500);
    } else {
      tryCast('Poison', 9, 2700);
    }

    Orion.WaitJournal(
      'You are at peace',
      Orion.Now(),
      Orion.Now() + CONFIG.PEACE_TIMEOUT,
    );
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
        Orion.MoveItem(itemsInBag[i], needed, 'backpack');
        Orion.Wait(500); // Даем сфере время переложить предмет
        needed =
          CONFIG.MINIMUM_REAGENT_COUNT - Orion.Count(reg, 'any', 'backpack'); // Перепроверяем
      }
    }
  }
}

/** Пытается скастовать спелл, если маны мало — медитирует */
function tryCast(spellName: string, manaCost: number, waitTime: number) {
  if (Player.Mana() >= manaCost) {
    Orion.Cast(spellName, 'self');
    Orion.Wait(waitTime);
  } else {
    meditateToFull();
  }
}

/** Медитирует до полного столба маны */
function meditateToFull() {
  while (Player.Mana() < Player.MaxMana()) {
    Orion.UseSkill('Meditation');
    // Ждем фейла или успеха медитации
    Orion.WaitJournal(
      'You lose your concentration|You are at peace',
      Orion.Now(),
      Orion.Now() + 4000,
    );
    Orion.Wait(100);
  }
}
