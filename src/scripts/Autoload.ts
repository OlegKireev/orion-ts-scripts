import { loot } from '@/lib/loot';

export function LootPvm() {
  loot(['Treasures', 'Money', 'Reagents', 'Resources', 'Miscellaneous']);
}

export function LootPvp() {
  loot(['Weapons', 'Armors', 'Money']);
}
