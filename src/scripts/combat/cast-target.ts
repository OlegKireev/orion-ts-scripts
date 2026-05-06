import { castSpell } from '@/lib/cast';

export function CastHarmTarget() {
  castSpell('Harm', 'lasttarget');
}

export function CastLightningTarget() {
  castSpell('Lightning', 'lasttarget');
}

export function CastEnergyBoltTarget() {
  castSpell('Energy Bolt', 'lasttarget');
}

export function CastCurseTarget() {
  castSpell('Curse', 'lasttarget');
}

export function CastPoisonTarget() {
  castSpell('Poison', 'lasttarget');
}

export function CastDispelTarget() {
  castSpell('Dispel', 'lasttarget', false);
}

export function CastManaDrainTarget() {
  castSpell('Mana Drain', 'lasttarget');
}

export function CastParalyzeTarget() {
  castSpell('Paralyze', 'lasttarget');
}

export function CastFeeblemindTarget() {
  castSpell('Feeblemind', 'lasttarget');
}

export function CastMagicArrowTarget() {
  castSpell('Magic Arrow', 'lasttarget');
}
