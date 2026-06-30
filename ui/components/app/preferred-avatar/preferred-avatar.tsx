import React from 'react';
import { useSelector } from 'react-redux';
import {
  AvatarAccount,
  AvatarAccountProps,
  AvatarAccountVariant,
} from '@metamask/design-system-react';
import type { MetaMaskReduxState } from '../../../store/store';
import { PolyconAvatar } from '../polycon-avatar';

const avatarTypeMap: Record<string, AvatarAccountVariant> = {
  maskicon: AvatarAccountVariant.Maskicon,
  jazzicon: AvatarAccountVariant.Jazzicon,
  blockies: AvatarAccountVariant.Blockies,
};

/**
 * Renders an avatar for an address based on the user's AIR Wallet avatar style setting.
 * Supports Jazzicon, Blockies, the custom Polycons renderer, and the legacy Maskicon style.
 *
 * @param props - Props forwarded to AvatarAccount (or PolyconAvatar for the polycons style)
 */
export const PreferredAvatar = (props: Omit<AvatarAccountProps, 'ref'>) => {
  const avatarType = useSelector(getAvatarTypeString);

  if (!avatarType || avatarType === 'polycons' || avatarType === 'maskicon') {
    return (
      <PolyconAvatar
        address={props.address}
        size={props.size}
        className={props.className}
        style={props.style as React.CSSProperties}
      />
    );
  }

  const variant = avatarType ? avatarTypeMap[avatarType] : undefined;
  return <AvatarAccount {...props} variant={variant} />;
};

/** Returns the AvatarAccountVariant for components that use AvatarAccount directly. */
export function getAvatarType({
  metamask: { preferences },
}: MetaMaskReduxState): AvatarAccountVariant | undefined {
  const avatarType = preferences?.avatarType;
  if (!avatarType) {
    return undefined;
  }
  return avatarTypeMap[avatarType]; // returns undefined for 'polycons', callers fall back to default
}

/** Returns the raw avatar preference string, including 'polycons'. */
export function getAvatarTypeString({
  metamask: { preferences },
}: MetaMaskReduxState): string | undefined {
  return preferences?.avatarType;
}
