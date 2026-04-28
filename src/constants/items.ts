import { toGraphic } from '@/lib/validators';

export interface Item {
  graphic: Graphic;
  color: string;
}

export const REAGENTS = {
  SpiderSilk: {
    graphic: toGraphic('0x0F8D'),
    color: '0x0000',
  },
  SulfurousAsh: {
    graphic: toGraphic('0x0F8C'),
    color: '0x0000',
  },
  Garlic: {
    graphic: toGraphic('0x0F84'),
    color: '0x0000',
  },
  Ginseng: {
    graphic: toGraphic('0x0F85'),
    color: '0x0000',
  },
  MandrakeRoot: {
    graphic: toGraphic('0x0F86'),
    color: '0x0000',
  },
  Nightshade: {
    graphic: toGraphic('0x0F88'),
    color: '0x0000',
  },
  BloodMoss: {
    graphic: toGraphic('0x0F7B'),
    color: '0x0000',
  },
  BlackPearl: {
    graphic: toGraphic('0x0F7A'),
    color: '0x0000',
  },
} as const satisfies Record<string, Item>;

export const INGOTS = {
  Iron: { graphic: toGraphic('0x1BEF'), color: '0x0000' },
  Rusty: { graphic: toGraphic('0x1BEF'), color: '0x09EB' },
  OldCopper: { graphic: toGraphic('0x1BEF'), color: '0x09E8' },
  DullCopper: { graphic: toGraphic('0x1BEF'), color: '0x060A' },
  Bronze: { graphic: toGraphic('0x1BEF'), color: '0x06D6' },
  Copper: { graphic: toGraphic('0x1BE3'), color: '0x0000' },
  Steel: { graphic: toGraphic('0x1BEF'), color: '0x09F1' },
  Silver: { graphic: toGraphic('0x1BF5'), color: '0x0000' },
  Gold: { graphic: toGraphic('0x1BE9'), color: '0x09B5' },
  Shadow: { graphic: toGraphic('0x1BEF'), color: '0x0770' },
  Bluesteel: { graphic: toGraphic('0x1BEF'), color: '0x0128' },
  Rose: { graphic: toGraphic('0x1BEF'), color: '0x0665' },
  Agapite: { graphic: toGraphic('0x1BEF'), color: '0x0400' },
  Bloodrock: { graphic: toGraphic('0x1BEF'), color: '0x09CF' },
  Verite: { graphic: toGraphic('0x1BEF'), color: '0x0BAA' },
  Valorite: { graphic: toGraphic('0x1BEF'), color: '0x0515' },
  Mytheril: { graphic: toGraphic('0x1BEF'), color: '0x052D' },
  Blackrock: { graphic: toGraphic('0x1BEF'), color: '0x0455' },
  MoonStone: { graphic: toGraphic('0x1BEF'), color: '0x0035' },
} as const satisfies Record<string, Item>;

export const LOGS = {
  Logs: { graphic: toGraphic('0x1BDD'), color: '0x0000' },
} as const satisfies Record<string, Item>;
