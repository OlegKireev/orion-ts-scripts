import { OpenNestedBags } from '@/lib/helpers';
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

  var bag1 = toSerial('0x4009e3bf'); //мешок для Gold Point
  var bag2 = toSerial('0x4038539f'); //мешок для Regs
  var bag3 = toSerial('0x4038539a'); //мешок для Bottle
  var bag4 = toSerial('0x403853a1'); //мешок для  arrow и bolt

  var bag6 = toSerial('0x40227428'); //мешок для Treasure Map (lvl 1)
  var bag7 = toSerial('0x4029e361'); //мешок для Treasure Map (lvl 2)
  var bag8 = toSerial('0x404552e0'); //мешок для Treasure Map (lvl 3)
  var bag9 = toSerial('0x401ca2c9'); //мешок для Treasure Map (lvl 4)
  var bag10 = toSerial('0x40350958'); //мешок для Treasure Map (lvl 5)

  var bag11 = toSerial('0x404552c1'); //мешок для Seed of Wisdom
  var bag12 = toSerial('0x40217b81'); //мешок для Seed of Light
  var bag13 = toSerial('0x40292165'); //мешок для Seed of Darkness
  var bag14 = toSerial('0x4014b5d9'); //мешок для Seed of Fire
  var bag15 = toSerial('0x40191bd6'); //мешок для Seed of Mind
  var bag16 = toSerial('0x4016e547'); //мешок для Seed of Nature

  var bag18 = toSerial('0x401e94f0'); //мешок для Balron Skin
  var bag19 = toSerial('0x402a6b92'); //мешок для Balron Skin
  var bag20 = toSerial('0x4022d013'); //мешок для Mindusa Queen Skin
  var bag21 = toSerial('0x401b23ef'); //мешок для Mindusa Queen Skin
  var bag22 = toSerial('0x40604d0b'); //мешок для Salamander King Skin
  var bag23 = toSerial('0x402d1453'); //мешок для Salamander King Skin
  var bag24 = toSerial('0x4015da6a'); //мешок для Wyrm Skin
  var bag25 = toSerial('0x403d11fe'); //мешок для Wyrm Skin
  var bag26 = toSerial('0x4036c018'); //мешок для Daemon Skin
  var bag27 = toSerial('0x4036c021'); //мешок для Wyvern Skin
  var bag28 = toSerial('0x4036c01a'); //мешок для Mindusa Skin
  var bag29 = toSerial('0x4036c01d'); //мешок для Salamander Skin

  var bag30 = toSerial('0x4036c01f'); //мешок для Hat of Darkness
  var bag31 = toSerial('0x402b04cb'); //мешок для Hat of Nature
  var bag32 = toSerial('0x4036c00f'); //мешок для Hat of Mind
  var bag33 = toSerial('0x402b04ca'); //мешок для Hat of Light
  var bag34 = toSerial('0x402b04cc'); //мешок для Hat of Fire
  var bag35 = toSerial('0x4006eda6'); //мешок для Enchanted Runestaff
  var bag36 = toSerial('0x4057736e'); //мешок для Scroll of Fire Bolt (Staff Recharge)

  var bag38 = toSerial('0x40350938'); //мешок для кристалов с кладов

  var bag50 = toSerial('0x401b9762'); //мешок для всякого
  var bag51 = toSerial('0x4022368f'); //мешок для всякого Bloodstone

  var bag389 = toSerial('0x403853a7'); //мешок для bandage
  var bag390 = toSerial('0x403f39fe'); //мешок для trash

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
      container: bag1,
    },

    {
      name: 'Sulfurous Ash',
      type: toGraphic('0x0f8c'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: "Spider's Silk",
      type: toGraphic('0x0f8d'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: 'Blood Moss',
      type: toGraphic('0x0f7b'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: 'Black Pearl',
      type: toGraphic('0x0f7a'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: 'Ginseng',
      type: toGraphic('0x0f85'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: 'Garlic',
      type: toGraphic('0x0f84'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: 'Nightshade',
      type: toGraphic('0x0f88'),
      color: '0x0000',
      container: bag2,
    },
    {
      name: 'Mandrake Root',
      type: toGraphic('0x0f86'),
      color: '0x0000',
      container: bag2,
    },

    {
      name: 'Empty Bottle',
      type: toGraphic('0x0f0e'),
      color: '0x0000',
      container: bag3,
    },

    {
      name: 'Bolt',
      type: toGraphic('0x1bfb'),
      color: '0x0000',
      container: bag4,
    },
    {
      name: 'Arrow',
      type: toGraphic('0x0f3f'),
      color: '0x0000',
      container: bag4,
    },
    {
      name: 'Ice Silk',
      type: toGraphic('0x0F8D'),
      color: '0x0480',
      container: bag4,
    },

    {
      name: 'Treasure Map (lvl 1)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: bag6,
    },
    {
      name: 'Treasure Map (lvl 2)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: bag7,
    },
    {
      name: 'Treasure Map (lvl 3)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: bag8,
    },
    {
      name: 'Treasure Map (lvl 4)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: bag9,
    },
    {
      name: 'Treasure Map (lvl 5)',
      type: toGraphic('0x14eb'),
      color: '0x0b16',
      container: bag10,
    },

    {
      name: 'Seed of Wisdom',
      type: toGraphic('0x1f1c'),
      color: '0x0ba0',
      container: bag11,
    },
    {
      name: 'Seed of Light',
      type: toGraphic('0x1f1c'),
      color: '0x0b0e',
      container: bag12,
    },
    {
      name: 'Seed of Darkness',
      type: toGraphic('0x1f1c'),
      color: '0x09c8',
      container: bag13,
    },
    {
      name: 'Seed of Fire',
      type: toGraphic('0x1f1c'),
      color: '0x09b3',
      container: bag14,
    },
    {
      name: 'Seed of Mind',
      type: toGraphic('0x1f1c'),
      color: '0x099a',
      container: bag15,
    },
    {
      name: 'Seed of Nature',
      type: toGraphic('0x1f1c'),
      color: '0x0a48',
      container: bag16,
    },

    {
      name: 'Balron Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: bag18,
    },
    {
      name: 'Balron Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: bag19,
    },
    {
      name: 'Mindusa Queen Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: bag20,
    },
    {
      name: 'Mindusa Queen Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: bag21,
    },
    {
      name: 'Salamander King Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: bag22,
    },
    {
      name: 'Salamander King Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: bag23,
    },
    {
      name: 'Wyrm Skin',
      type: toGraphic('0x1f03'),
      color: 'any',
      container: bag24,
    },
    {
      name: 'Wyrm Skin',
      type: toGraphic('0x1515'),
      color: 'any',
      container: bag25,
    },

    { name: 'Daemon Skin', type: 'any', color: 'any', container: bag26 },
    { name: 'Wyvern Skin', type: 'any', color: 'any', container: bag27 },
    { name: 'Mindusa Skin', type: 'any', color: 'any', container: bag28 },
    { name: 'Salamander Skin', type: 'any', color: 'any', container: bag29 },

    { name: 'Hat of Darkness', type: 'any', color: 'any', container: bag30 },
    { name: 'Hat of Nature', type: 'any', color: 'any', container: bag31 },
    { name: 'Hat of Mind', type: 'any', color: 'any', container: bag32 },
    { name: 'Hat of Light', type: 'any', color: 'any', container: bag33 },
    { name: 'Hat of Fire', type: 'any', color: 'any', container: bag34 },

    {
      name: 'Enchanted Runestaff',
      type: 'any',
      color: 'any',
      container: bag35,
    },
    {
      name: 'Scroll of Fire Bolt',
      type: 'any',
      color: 'any',
      container: bag36,
    },

    {
      name: 'star sapphires',
      type: toGraphic('0x0f0f'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'tourmalines',
      type: toGraphic('0x0f18'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'emeralds',
      type: toGraphic('0x0f10'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'diamonds',
      type: toGraphic('0x0f26'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'sapphires',
      type: toGraphic('0x0f11'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'citrines',
      type: toGraphic('0x0f15'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'amethysts',
      type: toGraphic('0x0f16'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'pieces of amber',
      type: toGraphic('0x0f25'),
      color: '0x0000',
      container: bag38,
    },
    {
      name: 'rubies',
      type: toGraphic('0x0f13'),
      color: '0x0000',
      container: bag38,
    },

    { name: 'Bloodstone', type: 'any', color: 'any', container: bag50 },
    { name: 'Balron Heart', type: 'any', color: 'any', container: bag50 },
    { name: 'cut up leather', type: 'any', color: 'any', container: bag50 },
    { name: 'Blue Blood', type: 'any', color: 'any', container: bag50 },
    { name: 'Daemon Bones', type: 'any', color: 'any', container: bag50 },
    { name: 'cuts of raw ribs', type: 'any', color: 'any', container: bag50 },
    { name: "Dragon's Blood", type: 'any', color: 'any', container: bag50 },

    { name: 'Bloodstone', type: 'any', color: 'any', container: bag51 },

    {
      name: 'bloody bandages',
      type: toGraphic('0x0e20'),
      color: 'any',
      container: bag389,
    },
    {
      name: 'clean bandages',
      type: toGraphic('0x0e21'),
      color: 'any',
      container: bag389,
    },

    {
      name: 'bag',
      type: toGraphic('0x0e76'),
      color: '0x00bb',
      container: bag390,
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
            Orion.MoveItem(serial, -1, item.container);
            Orion.Wait(100);
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
  var thetitle = Player.Title(); // для выбора расы под скрипты, на ЕП это реализовать нельзя, можно сделать по серийникам персов

  Orion.Print(thetitle);
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

  const list = Orion.GetFindList('RestockElf');
  if (list) {
    const requiredItems = list.Items();

    requiredItems.forEach((reqItem) => {
      if (!reqItem) {
        return;
      }
      let neededAmount =
        reqItem.Count() -
        Orion.Count(reqItem.Graphic(), reqItem.Color(), 'backpack', '', true);
      if (neededAmount > 0) {
        Orion.FindTypeEx('any', 'any', 'ground', '', '', '', true)
          .filter((container) => {
            return container.Serial() != Player.Serial();
          })
          .forEach((outside) => {
            Orion.ResetIgnoreList();
            Orion.FindTypeEx(
              reqItem.Graphic(),
              reqItem.Color(),
              outside.Serial(),
              '',
              2,
              '',
              true,
            ).forEach((item) => {
              Orion.ResetIgnoreList();
              neededAmount =
                reqItem.Count() -
                Orion.Count(
                  reqItem.Graphic(),
                  reqItem.Color(),
                  'backpack',
                  '',
                  true,
                );
              if (item.Container() != Player.Serial() && neededAmount > 0) {
                Orion.MoveItem(item.Serial(), neededAmount);
                Orion.Wait(100);
              }
            });
          });
      }
      Orion.Print(
        'Got ' + reqItem.Comment() + ' ' + reqItem.Count() + ' to unload',
      );
    });

    Orion.Print('Пополнился ресами');
    Orion.Wait(1000);
    // Auto_beckeck();

    const successful = requiredItems.every((item) => {
      return (
        item.Count() -
          Orion.Count(item.Graphic(), item.Color(), 'backpack', '', true) <=
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
//       Orion.Wait(200);
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
      Orion.MoveItem(item, 0, baglootpvp);
      Orion.Wait(100);
    });
  });
}
