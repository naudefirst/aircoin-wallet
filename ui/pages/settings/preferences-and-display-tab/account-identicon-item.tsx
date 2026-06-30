import React from 'react';
import { useSelector } from 'react-redux';
import {
  AvatarAccount,
  AvatarAccountVariant,
  Box,
  BoxFlexDirection,
  BoxAlignItems,
  Text,
  TextVariant,
  FontWeight,
  TextColor,
  AvatarAccountSize,
} from '@metamask/design-system-react';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { ACCOUNT_IDENTICON_ROUTE } from '../../../helpers/constants/routes';
import { getPreferences } from '../../../../shared/lib/selectors/preferences';
import { getSelectedInternalAccount } from '../../../../shared/lib/selectors/accounts';
import { SettingsSelectItem } from '../shared';
import { PREFERENCES_ITEMS } from '../search-config';
import { PolyconAvatar } from '../../../components/app/polycon-avatar';
import {
  AIR_AVATAR_POLYCONS,
  AVATAR_LABEL_MAP,
  type AirAvatarType,
} from './account-identicon-utils';

export const AccountIdenticonItem = () => {
  const t = useI18nContext();
  const { avatarType } = useSelector(getPreferences);
  const selectedAccount = useSelector(getSelectedInternalAccount);

  const currentVariant: AirAvatarType = avatarType ?? AIR_AVATAR_POLYCONS;
  const labelKey = AVATAR_LABEL_MAP[currentVariant] ?? AVATAR_LABEL_MAP[AIR_AVATAR_POLYCONS];

  // 'maskicon' is the legacy MetaMask default — AIR Wallet shows Polycons instead
  const usePolycons =
    currentVariant === AIR_AVATAR_POLYCONS || currentVariant === AvatarAccountVariant.Maskicon;

  const avatarPreview = usePolycons ? (
    <PolyconAvatar
      address={selectedAccount?.address}
      size={AvatarAccountSize.Sm}
    />
  ) : (
    <AvatarAccount
      address={selectedAccount?.address}
      variant={currentVariant as AvatarAccountVariant}
      size={AvatarAccountSize.Sm}
    />
  );

  return (
    <SettingsSelectItem
      label={t(PREFERENCES_ITEMS['account-identicon'])}
      to={ACCOUNT_IDENTICON_ROUTE}
      value={
        <Box
          flexDirection={BoxFlexDirection.Row}
          alignItems={BoxAlignItems.Center}
          gap={2}
        >
          {avatarPreview}
          <Text
            color={TextColor.TextAlternative}
            variant={TextVariant.BodyMd}
            fontWeight={FontWeight.Medium}
          >
            {t(labelKey)}
          </Text>
        </Box>
      }
    />
  );
};
