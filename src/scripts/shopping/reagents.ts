import { VendorShopper, ShopConfig } from '@/lib/shopping-engine';
import { toSerial, toGraphic } from '@lib/validators';

const config: ShopConfig = {
  route: [
    { coords: { x: 1234, y: 1567 } },
    { coords: { x: 4321, y: 1089 }, runeName: 'Britain' },
  ],
  items: [
    { name: 'Black Pearl', graphic: toGraphic('0x0F7A'), color: '0x0000' },
    { name: 'Garlic', graphic: toGraphic('0x0F84'), color: '0x0000' },
    { name: 'Ginseng', graphic: toGraphic('0x0F85'), color: '0x0000' },
    { name: 'Mandrake Root', graphic: toGraphic('0x0F86'), color: '0x0000' },
    { name: 'Nightshade', graphic: toGraphic('0x0F88'), color: '0x0000' },
    { name: 'Spider Silk', graphic: toGraphic('0x0F8D'), color: '0x0000' },
    { name: 'Sulfurous Ash', graphic: toGraphic('0x0F8C'), color: '0x0000' },
    { name: 'Blood Moss', graphic: toGraphic('0x0F7B'), color: '0x0000' },
  ],
  travelBookSerial: toSerial('0x40123456'),
  homeCoords: { x: 898, y: 1874 },
  homeRuneName: 'Castle',
  storageChestSerial: toSerial('0x403853AB'),
};

export function Autostart(): void {
  var shopper = new VendorShopper(config);
  shopper.run();
}
