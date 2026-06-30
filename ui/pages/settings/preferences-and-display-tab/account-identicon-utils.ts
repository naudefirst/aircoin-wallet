import { AvatarAccountVariant } from '@metamask/design-system-react';

/** Extends the design-system variants with AIR Wallet's custom Polycons renderer. */
export type AirAvatarType = AvatarAccountVariant | 'polycons';

/** The 'polycons' string constant, kept typed for use as an AirAvatarType. */
export const AIR_AVATAR_POLYCONS = 'polycons' as const satisfies AirAvatarType;

// Avatar style options shown in the picker, ordered by visual style.
export const AVATAR_OPTIONS: {
  value: AirAvatarType;
  labelKey: string;
}[] = [
  { value: AIR_AVATAR_POLYCONS, labelKey: 'polycons' },
  { value: AvatarAccountVariant.Jazzicon, labelKey: 'jazzicons' },
  { value: AvatarAccountVariant.Blockies, labelKey: 'blockies' },
];

// Map of avatar type → i18n key, used for the current-value display in the settings list.
export const AVATAR_LABEL_MAP: Record<AirAvatarType, string> = {
  polycons: 'polycons',
  [AvatarAccountVariant.Maskicon]: 'maskicons',
  [AvatarAccountVariant.Jazzicon]: 'jazzicons',
  [AvatarAccountVariant.Blockies]: 'blockies',
};
