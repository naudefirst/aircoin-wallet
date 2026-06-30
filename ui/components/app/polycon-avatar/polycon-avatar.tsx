import React from 'react';
import {
  AvatarAccount,
  AvatarAccountVariant,
} from '@metamask/design-system-react';
import type { AvatarAccountSize } from '@metamask/design-system-react';

export type PolyconAvatarProps = {
  address?: string;
  size?: AvatarAccountSize | number | string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Renders an AIR Wallet Polycon avatar for a given address.
 * Falls back to Blockies while the Polycon renderer is being implemented.
 */
export const PolyconAvatar = ({
  address,
  size,
  className,
  style,
}: PolyconAvatarProps) => {
  return (
    <AvatarAccount
      address={address ?? ''}
      variant={AvatarAccountVariant.Blockies}
      size={size as AvatarAccountSize}
      className={className}
      style={style}
    />
  );
};