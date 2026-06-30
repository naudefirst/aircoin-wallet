import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AvatarAccount,
  AvatarAccountVariant,
  Box,
  BoxFlexDirection,
  BoxJustifyContent,
  BoxAlignItems,
  FontWeight,
  Icon,
  IconName,
  IconSize,
  IconColor,
  Text,
  TextVariant,
  AvatarAccountSize,
} from '@metamask/design-system-react';
import { setAvatarType } from '../../../store/actions';
import { PREFERENCES_AND_DISPLAY_ROUTE } from '../../../helpers/constants/routes';
import { getPreferences } from '../../../../shared/lib/selectors/preferences';
import { getSelectedInternalAccount } from '../../../../shared/lib/selectors/accounts';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { PolyconAvatar } from '../../../components/app/polycon-avatar';
import {
  AVATAR_OPTIONS,
  AIR_AVATAR_POLYCONS,
  type AirAvatarType,
} from './account-identicon-utils';

/** Renders the live avatar preview for a given option in the picker. */
const AvatarPreview = ({
  value,
  address,
}: {
  value: AirAvatarType;
  address?: string;
}) => {
  if (value === AIR_AVATAR_POLYCONS) {
    return (
      <PolyconAvatar address={address} size={AvatarAccountSize.Md} />
    );
  }
  return (
    <AvatarAccount
      address={address}
      variant={value as AvatarAccountVariant}
      size={AvatarAccountSize.Md}
    />
  );
};

const AccountIdenticonSubPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useI18nContext();
  const { avatarType } = useSelector(getPreferences);
  const selectedAccount = useSelector(getSelectedInternalAccount);

  const currentVariant: AirAvatarType = avatarType ?? AIR_AVATAR_POLYCONS;

  const handleSelect = (value: AirAvatarType) => {
    dispatch(setAvatarType(value));
    navigate(PREFERENCES_AND_DISPLAY_ROUTE);
  };

  return (
    <Box data-testid="account-identicon-list">
      {AVATAR_OPTIONS.map(({ value, labelKey }) => {
        const isSelected = value === currentVariant;
        return (
          <Box
            key={value}
            data-testid={`account-identicon-option-${value}`}
            flexDirection={BoxFlexDirection.Row}
            justifyContent={BoxJustifyContent.Between}
            alignItems={BoxAlignItems.Center}
            className={`w-full cursor-pointer border-0 p-4 ${
              isSelected
                ? 'bg-muted hover:bg-muted-hover'
                : 'bg-background-default hover:bg-background-default-hover'
            }`}
            onClick={() => handleSelect(value)}
          >
            <Box
              flexDirection={BoxFlexDirection.Row}
              alignItems={BoxAlignItems.Center}
              gap={3}
            >
              <AvatarPreview
                value={value}
                address={selectedAccount?.address}
              />
              <Text variant={TextVariant.BodyMd} fontWeight={FontWeight.Medium}>
                {t(labelKey)}
              </Text>
            </Box>
            {isSelected && (
              <Icon
                name={IconName.Check}
                size={IconSize.Md}
                color={IconColor.IconDefault}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default AccountIdenticonSubPage;
