import { OpenNestedBags, getPlayerRace, moveItem } from '@/lib/helpers';
import { toGraphic, toSerial } from '@/lib/validators';

const baglootpvp = 'backpack' as const;

//Кликер итемов
function ClickAllItems() {
  const clicks = Orion.FindType('any', 'any', 'backpack');
  for (let i = 0; i < clicks.length; i++) {
    const serial = clicks[i];
    Orion.Click(serial);
    Orion.Wait(100);
  }
}

// Расфасовка
export function Sorting() {
  const ROOT_CHEST = toSerial('0x4037662D'); //основная сумка

  const chestObject = Orion.FindObject(ROOT_CHEST);

  if (chestObject) {
    Orion.WalkTo(chestObject.X(), chestObject.Y(), chestObject.Z(), 2);
  }

  Orion.UseObject(baglootpvp);
  Orion.Wait(500);

  unloadBags();
  Orion.Wait(200);

  OpenNestedBags(ROOT_CHEST);

  ClickAllItems();
  Orion.Wait(1000);

  // Containers
  const gold = toSerial('0x4009e3bf'); //мешок для Gold Point
  const reagents = toSerial('0x4038539f'); //мешок для Regs
  const alchemy = toSerial('0x4038539a'); //мешок для Bottle
  const arrows = toSerial('0x403853a1'); //мешок для  arrow и bolt

  const map1 = toSerial('0x40227428'); //мешок для Treasure Map (lvl 1)
  const map2 = toSerial('0x4029e361'); //мешок для Treasure Map (lvl 2)
  const map3 = toSerial('0x404552e0'); //мешок для Treasure Map (lvl 3)
  const map4 = toSerial('0x401ca2c9'); //мешок для Treasure Map (lvl 4)
  const map5 = toSerial('0x40350958'); //мешок для Treasure Map (lvl 5)
  const map6 = toSerial('0x40618B06'); //мешок для Treasure Map (lvl 6)

  const seedOfWisdom = toSerial('0x404552c1'); //мешок для Seed of Wisdom
  const seedOfLight = toSerial('0x40217b81'); //мешок для Seed of Light
  const seedOfDarkness = toSerial('0x40292165'); //мешок для Seed of Darkness
  const seedOfFire = toSerial('0x4014b5d9'); //мешок для Seed of Fire
  const seedOfMind = toSerial('0x405504F6'); //мешок для Seed of Mind
  const seedOfNature = toSerial('0x4016e547'); //мешок для Seed of Nature

  const balronRobe = toSerial('0x401e94f0'); //мешок для Balron Skin
  const balronCloak = toSerial('0x402a6b92'); //мешок для Balron Skin
  const mindusaQueenRobe = toSerial('0x4022d013'); //мешок для Mindusa Queen Skin
  const mindusaQueenCloak = toSerial('0x401b23ef'); //мешок для Mindusa Queen Skin
  const salamanderKingRobe = toSerial('0x40604d0b'); //мешок для Salamander King Skin
  const salamanderKingCloak = toSerial('0x402d1453'); //мешок для Salamander King Skin
  const wyrmRobe = toSerial('0x4015da6a'); //мешок для Wyrm Skin
  const wyrmCloak = toSerial('0x403d11fe'); //мешок для Wyrm Skin
  const daemonSkin = toSerial('0x4036c018'); //мешок для Daemon Skin
  const wyvernSkin = toSerial('0x4036c021'); //мешок для Wyvern Skin
  const mindusaSkin = toSerial('0x4036c01a'); //мешок для Mindusa Skin
  const salamanderSkin = toSerial('0x4036c01d'); //мешок для Salamander Skin

  const hatOfDarkness = toSerial('0x4036c01f'); //мешок для Hat of Darkness
  const hatOfNature = toSerial('0x402b04cb'); //мешок для Hat of Nature
  const harOfMind = toSerial('0x4036c00f'); //мешок для Hat of Mind
  const hatOfLight = toSerial('0x402b04ca'); //мешок для Hat of Light
  const hatOfFire = toSerial('0x402b04cc'); //мешок для Hat of Fire
  const runestaff = toSerial('0x4006eda6'); //мешок для Enchanted Runestaff
  const scorllOfFirebolt = toSerial('0x4057736e'); //мешок для Scroll of Fire Bolt (Staff Recharge)

  const jewel = toSerial('0x40350938'); //мешок для кристалов с кладов

  const monsterResources = toSerial('0x401b9762'); //мешок для всякого
  const bloodstone = toSerial('0x4022368F'); //мешок для всякого Bloodstone

  const bandage = toSerial('0x403853a7'); //мешок для bandage
  const trash = toSerial('0x403f39fe'); //мешок для trash

  interface Item {
    name: string;
    type: Graphic;
    color: string;
    container: Serial;
  }

  const ITEM_LIST: Item[] = [
    {
      name: 'gold coin',
      type: toGraphic('0x0eed'),
      color: '0x0000',
      container: gold,
    },

    {
      name: 'Sulfurous Ash',
      type: toGraphic('0x0f8c'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: "Spider's Silk",
      type: toGraphic('0x0f8d'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: 'Blood Moss',
      type: toGraphic('0x0f7b'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: 'Black Pearl',
      type: toGraphic('0x0f7a'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: 'Ginseng',
      type: toGraphic('0x0f85'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: 'Garlic',
      type: toGraphic('0x0f84'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: 'Nightshade',
      type: toGraphic('0x0f88'),
      color: '0x0000',
      container: reagents,
    },
    {
      name: 'Mandrake Root',
      type: toGraphic('0x0f86'),
      color: '0x0000',
      container: reagents,
    },

    {
      name: 'Empty Bottle',
      type: toGraphic('0x0f0e'),
      color: '0x0000',
      container: alchemy,
    },

    {
      name: 'Bolt',
      type: toGraphic('0x1bfb'),
      color: '0x0000',
      container: arrows,
    },
    {
      name: 'Arrow',
      type: toGraphic('0x0f3f'),
      color: '0x0000',
      container: arrows,
    },
    {
      name: 'Ice Silk',
      type: toGraphic('0x0F8D'),
      color: '0x0480',
      container: arrows,
    },

    {
      name: 'Treasure Map (lvl 1)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: map1,
    },
    {
      name: 'Treasure Map (lvl 2)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: map2,
    },
    {
      name: 'Treasure Map (lvl 3)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: map3,
    },
    {
      name: 'Treasure Map (lvl 4)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: map4,
    },
    {
      name: 'Treasure Map (lvl 5)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: map5,
    },
    {
      name: 'Treasure Map (lvl 6)',
      type: toGraphic('0x14EB'),
      color: '0x0B90',
      container: map6,
    },
    {
      name: 'Seed of Wisdom',
      type: toGraphic('0x1f1c'),
      color: '0x0ba0',
      container: seedOfWisdom,
    },
    {
      name: 'Seed of Light',
      type: toGraphic('0x1f1c'),
      color: '0x0b0e',
      container: seedOfLight,
    },
    {
      name: 'Seed of Darkness',
      type: toGraphic('0x1f1c'),
      color: '0x09c8',
      container: seedOfDarkness,
    },
    {
      name: 'Seed of Fire',
      type: toGraphic('0x1f1c'),
      color: '0x09b3',
      container: seedOfFire,
    },
    {
      name: 'Seed of Mind',
      type: toGraphic('0x1f1c'),
      color: '0x099a',
      container: seedOfMind,
    },
    {
      name: 'Seed of Nature',
      type: toGraphic('0x1f1c'),
      color: '0x0a48',
      container: seedOfNature,
    },

    {
      name: 'Balron Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: balronRobe,
    },
    {
      name: 'Balron Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: balronCloak,
    },
    {
      name: 'Mindusa Queen Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: mindusaQueenRobe,
    },
    {
      name: 'Mindusa Queen Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: mindusaQueenCloak,
    },
    {
      name: 'Salamander King Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: salamanderKingRobe,
    },
    {
      name: 'Salamander King Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: salamanderKingCloak,
    },
    {
      name: 'Wyrm Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: wyrmRobe,
    },
    {
      name: 'Wyrm Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: wyrmCloak,
    },

    { name: 'Daemon Skin', type: 'any', color: 'any', container: daemonSkin },
    { name: 'Wyvern Skin', type: 'any', color: 'any', container: wyvernSkin },
    { name: 'Mindusa Skin', type: 'any', color: 'any', container: mindusaSkin },
    {
      name: 'Salamander Skin',
      type: 'any',
      color: 'any',
      container: salamanderSkin,
    },

    {
      name: 'Hat of Darkness',
      type: 'any',
      color: 'any',
      container: hatOfDarkness,
    },
    {
      name: 'Hat of Nature',
      type: 'any',
      color: 'any',
      container: hatOfNature,
    },
    { name: 'Hat of Mind', type: 'any', color: 'any', container: harOfMind },
    { name: 'Hat of Light', type: 'any', color: 'any', container: hatOfLight },
    { name: 'Hat of Fire', type: 'any', color: 'any', container: hatOfFire },

    {
      name: 'Enchanted Runestaff',
      type: 'any',
      color: 'any',
      container: runestaff,
    },
    {
      name: 'Scroll of Fire Bolt',
      type: 'any',
      color: 'any',
      container: scorllOfFirebolt,
    },

    {
      name: 'star sapphires',
      type: toGraphic('0x0f0f'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'tourmalines',
      type: toGraphic('0x0f18'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'emeralds',
      type: toGraphic('0x0f10'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'diamonds',
      type: toGraphic('0x0f26'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'sapphires',
      type: toGraphic('0x0f11'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'citrines',
      type: toGraphic('0x0f15'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'amethysts',
      type: toGraphic('0x0f16'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'pieces of amber',
      type: toGraphic('0x0f25'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'rubies',
      type: toGraphic('0x0f13'),
      color: '0x0000',
      container: jewel,
    },
    {
      name: 'Balron Heart',
      type: 'any',
      color: 'any',
      container: monsterResources,
    },
    {
      name: 'cut up leather',
      type: 'any',
      color: 'any',
      container: monsterResources,
    },
    {
      name: 'Blue Blood',
      type: 'any',
      color: 'any',
      container: monsterResources,
    },
    {
      name: 'Daemon Bones',
      type: 'any',
      color: 'any',
      container: monsterResources,
    },
    {
      name: 'cuts of raw ribs',
      type: 'any',
      color: 'any',
      container: monsterResources,
    },
    {
      name: "Dragon's Blood",
      type: 'any',
      color: 'any',
      container: monsterResources,
    },

    { name: 'Bloodstone', type: 'any', color: 'any', container: bloodstone },

    {
      name: 'bloody bandages',
      type: toGraphic('0x0e20'),
      color: 'any',
      container: bandage,
    },
    {
      name: 'clean bandages',
      type: toGraphic('0x0e21'),
      color: 'any',
      container: bandage,
    },

    {
      name: 'bag',
      type: toGraphic('0x0e76'),
      color: '0x00bb',
      container: trash,
    },
  ];

  ITEM_LIST.forEach((item) => {
    Orion.ResetIgnoreList();
    const serials = Orion.FindType(item.type, item.color, baglootpvp);
    if (serials.length) {
      serials.forEach((serial) => {
        const object = Orion.FindObject(serial);
        if (!object) {
          return;
        }

        if (Orion.Contains(object.Name(), item.name)) {
          Orion.Print(`Штук ${object.Count()} ${item.name} для сброса`);
          if (Orion.FindObject(item.container)) {
            moveItem(serial, -1, item.container);
          } else {
            Orion.Print(`Не удалось найти контейнер ${item.name}, пропускаю`);
          }
        }
      });
    }
  });
  Orion.Print('Разгрузился');
  Orion.Wait(200);
  Restock();
}

// Ресток из листа
export function Restock() {
  const race = getPlayerRace();

  // переменные: сумки/сундуки для добора
  const chest = toSerial('0x4037662D'); //основная сумка, занесена в Lists
  const regsBag = toSerial('0x4038539F'); //сумка для регов
  const arrowsBag = toSerial('0x403853A1'); //сумка для стрел|болтов
  const foodBag = toSerial('0x40385395'); //сумка для еды
  const alchemyBag = chest; //  //сумка для алхимии

  const bags = [chest, regsBag, foodBag, alchemyBag, arrowsBag];
  bags.forEach((bag) => {
    Orion.UseObject(bag);
    Orion.Wait(50);
  });

  const list = Orion.GetFindList(race);

  if (list) {
    const requiredItems = list.Items();

    // Кешируем данные из QObject'ов, чтобы избежать обращения к удалённым объектам
    const cachedItems = requiredItems
      .filter((reqItem) => !!reqItem)
      .map((reqItem) => ({
        graphic: reqItem.Graphic(),
        color: reqItem.Color(),
        count: reqItem.Count(),
        comment: reqItem.Comment(),
      }));

    cachedItems.forEach((req) => {
      let neededAmount =
        req.count - Orion.Count(req.graphic, req.color, 'backpack', '', true);
      if (neededAmount > 0) {
        const containers = Orion.FindTypeEx(
          'any',
          'any',
          'ground',
          '',
          '',
          '',
          true,
        );
        const containerSerials = containers
          .filter((container) => container.Serial() != Player.Serial())
          .map((container) => container.Serial());

        containerSerials.forEach((containerSerial) => {
          Orion.ResetIgnoreList();
          const found = Orion.FindTypeEx(
            req.graphic,
            req.color,
            containerSerial,
            '',
            2,
            '',
            true,
          );
          // Кешируем серийники найденных предметов
          const itemSerials = found.map((item) => item.Serial());

          itemSerials.forEach((itemSerial) => {
            Orion.ResetIgnoreList();
            neededAmount =
              req.count -
              Orion.Count(req.graphic, req.color, 'backpack', '', true);
            const obj = Orion.FindObject(itemSerial);
            if (obj && obj.Container() != Player.Serial() && neededAmount > 0) {
              moveItem(itemSerial, neededAmount, 'backpack');
            }
          });
        });
      }
      Orion.Print('Got ' + req.comment + ' ' + req.count + ' to unload');
    });

    Orion.Print('Пополнился ресами');
    Orion.Wait(1000);

    const successful = cachedItems.every((req) => {
      return (
        req.count - Orion.Count(req.graphic, req.color, 'backpack', '', true) <=
        0
      );
    });

    return successful;
  } else {
    Orion.Print('Не удалось найти список для текущего класса.');
    return false;
  }
}

// // Расфасовка по паку
// function Auto_beckeck() {
//   var items = [
//     ['Invisibility', '0x0F0E', '0x09F2', 0, 160, 40],
//     ['Arch Mana Refresh', '0x0F09', '0x0B87', 0, 140, 40],
//     ['Total Mana Refresh', '0x0F09', '0x0388', 0, 128, 40],
//     ['Total Refresh', '0x0F0B', '0x0000', 0, 110, 40],
//     ['empty bottle', '0x0F0E', '0x0000', 0, 50, 40],
//     ['scissors', '0x0F9E', 'any', 0, 30, 20],
//     ['dagger', '0x0F51', 'any', 0, 55, 20],
//     ['key', '0x100E', 'any', 0, 40, 40],

//     ['1', '0x0F7A', '0x0000', 0, 160, 170],
//     ['2', '0x0F8C', '0x0000', 0, 160, 170],
//     ['3', '0x0F86', '0x0000', 0, 160, 170],
//     ['4', '0x0F84', '0x0000', 0, 160, 170],
//     ['5', '0x0F88', '0x0000', 0, 160, 170],
//     ['6', '0x0F85', '0x0000', 0, 160, 170],
//     ['7', '0x0F8D', '0x0000', 0, 160, 170],
//     ['8', '0x0F7B', '0x0000', 0, 160, 170],

//     ['Bint', '0x0E21', 'any', 0, 130, 170],
//     ['bloody_Bint', '0x0E20', 'any', 0, 120, 170],

//     ['speelbook', '0x0EFA', '0x0000', 0, 20, 60],
//     ['TravelBook_1', '0x0EFA', '0x0127', 0, 20, 40],
//     ['TravelBook_2', '0x0EFA', '0x0006', 0, 40, 40],

//     ['TravelBook_map1', '0x0EFA', '0x0152', 0, 180, 40],
//     ['TravelBook_map2', '0x0EFA', '0x0170', 0, 180, 60],
//     ['TravelBook_map3', '0x0EFA', '0x00C6', 0, 180, 80],
//     ['TravelBook_map4', '0x0EFA', '0x0076', 0, 180, 100],

//     ['Rune', '0x1F14', '0x0000', 0, 60, 170],
//     ['Arrow', '0x0F3F', '0x0000', 0, 70, 170],
//     ['Bolt', '0x1BFB', '0x0000', 0, 80, 175],
//   ];

//   Orion.ResetIgnoreList(); // Сброс игнорируемых объектов один раз в начале

//   for (i in items) {
//     var found = Orion.FindType(items[i][1], items[i][2], backpack);
//     for (var f = 0; f < found.length; f++) {
//       Orion.MoveItem(found[f], 0, backpack, items[i][4], items[i][5], 0);
//       Orion.Wait(ITEM_MOVE_DELAY);
//     }
//   }
// }

// // Функция для разгрузки предметов из сумок
export function unloadBags() {
  const boxes = toGraphic('0x0E7D|0x09AA|0x0E75|0x0E76|0x09B0'); //сумки
  const bags = Orion.FindType(boxes, 'any', baglootpvp);

  bags.forEach((bag) => {
    Orion.UseObject(bag);
    Orion.Wait(100);
    Orion.ResetIgnoreList();

    const items = Orion.FindType('any', 'any', bag);
    items.forEach((item) => {
      moveItem(item, 0, baglootpvp);
    });
  });
}
