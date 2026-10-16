import { characterPersona } from './persona';
import { siPersona } from './siPersona';

export type AssistantCharacter = 'fangyi' | 'si';

const profiles = {
  fangyi: { ...characterPersona, avatar: '/characters/fangyi-bouquet-avatar.png' },
  si: { ...siPersona, avatar: '/themes/si/portrait.png' },
} as const;

export function getCharacterProfile(character: AssistantCharacter = 'fangyi') {
  return profiles[character];
}
