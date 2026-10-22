import { characterPersona } from './persona';
import { siPersona } from './siPersona';

export type AssistantCharacter = 'fangyi' | 'si';

const profiles = {
  fangyi: { ...characterPersona, avatar: '/characters/fangyi-bouquet-avatar.webp' },
  si: { ...siPersona, avatar: '/themes/si/official/01.png' },
} as const;

export function getCharacterProfile(character: AssistantCharacter = 'fangyi') {
  return profiles[character];
}
