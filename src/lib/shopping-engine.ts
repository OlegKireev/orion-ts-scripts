import { checkLag } from './helpers';
import { openContainer } from './container';

// ==========================================
// ИНТЕРФЕЙСЫ
// ==========================================

export interface BuyItemDef {
  name: string;
  graphic: Graphic;
  color: string;
}

export interface ShopWaypoint {
  coords: Point2D;
  runeName?: string;
}

export interface ShopConfig {
  route: ShopWaypoint[];
  items: BuyItemDef[];
  travelBookSerial: Serial;
  homeCoords: Point2D;
  homeRuneName?: string;
  storageChestSerial: Serial;
  weightThreshold?: number;
  walkDistanceThreshold?: number;
  vendorSearchRadius?: number;
}

// ==========================================
// ДВИЖОК
// ==========================================

export class VendorShopper {
  private config: ShopConfig;
  private weightThreshold: number;
  private walkDistanceThreshold: number;
  private vendorSearchRadius: number;

  constructor(config: ShopConfig) {
    this.config = config;
    this.weightThreshold = config.weightThreshold || 0.75;
    this.walkDistanceThreshold = config.walkDistanceThreshold || 50;
    this.vendorSearchRadius = config.vendorSearchRadius || 18;
  }

  public run(): void {
    Orion.Print('Запуск закупщика...');
    Orion.ResetIgnoreList();

    while (true) {
      for (var i = 0; i < this.config.route.length; i++) {
        var waypoint = this.config.route[i];

        if (this.isOverweight()) {
          Orion.Print('Перевес! Еду разгружаться...');
          this.unloadAtHome();
        }

        this.travelTo(waypoint);
        this.processWaypoint();
      }

      // После полного обхода — выгрузить остатки
      Orion.Print('Маршрут завершен, выгружаю остатки...');
      this.unloadAtHome();
      Orion.ResetIgnoreList();
    }
  }

  private travelTo(waypoint: ShopWaypoint): void {
    var distance = Orion.GetDistance(waypoint.coords.x, waypoint.coords.y);

    if (distance <= this.walkDistanceThreshold || !waypoint.runeName) {
      Orion.Print(
        'Иду пешком к точке (' +
          waypoint.coords.x +
          ', ' +
          waypoint.coords.y +
          ')',
      );
      this.walkTo(waypoint.coords);
    } else {
      Orion.Print('Телепортируюсь: ' + waypoint.runeName);
      this.useTravelBook(waypoint.runeName);
      this.walkTo(waypoint.coords);
    }
  }

  private walkTo(coords: Point2D): void {
    checkLag();
    Orion.WalkTo(coords.x, coords.y, Player.Z(), 1, 255, true, true);
  }

  private useTravelBook(runeName: string): void {
    checkLag();

    var startX = Player.X();
    var startY = Player.Y();

    Orion.UseObject(this.config.travelBookSerial);

    if (!Orion.WaitForMenu(3000)) {
      Orion.Print('[ОШИБКА] TravelBook меню не появилось');
      return;
    }

    var menu = Orion.GetMenu('last');
    if (!menu) {
      Orion.Print('[ОШИБКА] Не удалось получить меню TravelBook');
      return;
    }

    menu.Select(runeName);

    // Ждём телепорта — изменения координат
    var timeout = Orion.Now() + 10000;
    while (Orion.Now() < timeout) {
      if (Player.X() !== startX || Player.Y() !== startY) {
        break;
      }
      Orion.Wait(200);
    }

    checkLag();
    Orion.Wait(500);
  }

  private processWaypoint(): void {
    var npcs = Orion.FindTypeEx(
      'any' as Graphic,
      'any',
      'ground',
      'human',
      this.vendorSearchRadius,
    );

    if (npcs.length === 0) {
      Orion.Print('Вендоров не найдено в радиусе');
      return;
    }

    Orion.Print('Найдено NPC: ' + npcs.length);

    for (var i = 0; i < npcs.length; i++) {
      var npc = npcs[i];

      if (this.isOverweight()) {
        Orion.Print('Перевес! Прерываю покупки.');
        return;
      }

      // Подходим к NPC
      Orion.WalkTo(npc.X(), npc.Y(), npc.Z(), 1, 255, true, true);
      Orion.Wait(300);

      // Говорим buy
      checkLag();
      Orion.Say('buy');

      // Ждём появления шоп-гампа
      var shopAppeared = false;
      var waitEnd = Orion.Now() + 3000;
      while (Orion.Now() < waitEnd) {
        if (Orion.GumpExists('shop', npc.Serial())) {
          shopAppeared = true;
          break;
        }
        Orion.Wait(200);
      }

      if (!shopAppeared) {
        // NPC не вендор — пропускаем
        Orion.Ignore(npc.Serial());
        continue;
      }

      Orion.Print('Покупаю у: ' + npc.Name());
      this.buyFromVendor(npc);
      Orion.Ignore(npc.Serial());
    }
  }

  private buyFromVendor(vendor: GameObject): void {
    for (var i = 0; i < this.config.items.length; i++) {
      var item = this.config.items[i];

      var vendorItems = Orion.FindType(
        item.graphic,
        item.color,
        vendor.Serial(),
      );

      for (var j = 0; j < vendorItems.length; j++) {
        if (this.isOverweight()) {
          Orion.Print('Перевес, прекращаю покупку');
          Orion.CloseGump('shop' as GumpType, vendor.Serial());
          return;
        }

        checkLag();
        Orion.MoveItem(vendorItems[j], 0, 'backpack' as Serial);
        Orion.Wait(300);
        Orion.Print('Купил: ' + item.name);
      }
    }

    Orion.CloseGump('shop' as GumpType, vendor.Serial());
  }

  private isOverweight(): boolean {
    return Player.Weight() >= Player.MaxWeight() * this.weightThreshold;
  }

  private unloadAtHome(): void {
    var distance = Orion.GetDistance(
      this.config.homeCoords.x,
      this.config.homeCoords.y,
    );

    if (distance > this.walkDistanceThreshold && this.config.homeRuneName) {
      this.useTravelBook(this.config.homeRuneName);
    }

    this.walkTo(this.config.homeCoords);
    openContainer(this.config.storageChestSerial);

    for (var i = 0; i < this.config.items.length; i++) {
      var item = this.config.items[i];
      var backpackItems = Orion.FindType(
        item.graphic,
        item.color,
        'backpack' as Serial,
      );

      for (var j = 0; j < backpackItems.length; j++) {
        checkLag();
        Orion.MoveItem(backpackItems[j], 0, this.config.storageChestSerial);
        Orion.Wait(100);
      }
    }

    Orion.Print('Выгрузка завершена');
  }
}
