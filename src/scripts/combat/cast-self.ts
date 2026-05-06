import { castSpell } from '@/lib/cast';

export function CastCunning() {
  castSpell('Cunning', 'self');
}

export function CastBless() {
  castSpell('Bless', 'self');
}

export function CastStrength() {
  castSpell('Strength', 'self');
}

export function CastAgility() {
  castSpell('Agility', 'self');
}

export function CastProtection() {
  castSpell('Protection', 'self');
}

export function CastHealSelf() {
  castSpell('Heal', 'self');
}

export function CastGreaterHealSelf() {
  castSpell('Greater Heal', 'self');
}

export function CastCureSelf() {
  castSpell('Cure', 'self', false);
}

export function CastDispelSelf() {
  castSpell('Dispel', 'self', false);
}

export function CastMagicReflectionSelf() {
  castSpell('Magic Reflection', 'self', false);
}

export function CastMagicArrowSelf() {
  castSpell('Magic Arrow', 'self', false);
}
