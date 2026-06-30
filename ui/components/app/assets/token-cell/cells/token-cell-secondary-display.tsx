import React, { CSSProperties } from 'react';
import { useSelector } from 'react-redux';
import cn from 'clsx';
import { Skeleton } from '@metamask/design-system-react';
import {
  FontWeight,
  TextAlign,
} from '../../../../../helpers/constants/design-system';
import {
  SensitiveText,
  SensitiveTextLength,
} from '../../../../component-library';
import {
  getUseCurrencyRateCheck,
  selectAnyEnabledNetworksAreAvailable,
} from '../../../../../selectors';
import { TokenFiatDisplayInfo } from '../../types';
import { isZeroAmount } from '../../../../../helpers/utils/number-utils';

type TokenCellSecondaryDisplayProps = {
  token: TokenFiatDisplayInfo;
  privacyMode: boolean;
};

const secondaryDisplayStyle: CSSProperties = {
  whiteSpace: 'nowrap',
  paddingInlineStart: 8,
};

export const TokenCellSecondaryDisplay = React.memo(
  ({
    token,
    privacyMode,
  }: TokenCellSecondaryDisplayProps) => {
    const useCurrencyRateCheck = useSelector(getUseCurrencyRateCheck);

    const anyEnabledNetworksAreAvailable = useSelector(
      selectAnyEnabledNetworksAreAvailable,
    );

    const secondaryDisplayText = useCurrencyRateCheck
      ? token.secondary || '—'
      : '';

    // secondary display text
    return (
      <Skeleton
        hideChildren={
          !anyEnabledNetworksAreAvailable &&
          isZeroAmount(secondaryDisplayText) &&
          secondaryDisplayText !== '—'
        }
        className="mb-1"
      >
        <SensitiveText
          fontWeight={token.secondary ? FontWeight.Medium : FontWeight.Normal}
          className={cn(
            token.secondary ? 'text-s-body-md' : 'text-s-body-sm',
            '@compact:text-s-body-sm',
          )}
          textAlign={TextAlign.End}
          data-testid="multichain-token-list-item-secondary-value"
          ellipsis={token.isStakeable}
          isHidden={privacyMode}
          length={SensitiveTextLength.Medium}
          style={secondaryDisplayStyle}
        >
          {secondaryDisplayText}
        </SensitiveText>
      </Skeleton>
    );
  },
  (prevProps, nextProps) =>
    prevProps.token.secondary === nextProps.token.secondary &&
    prevProps.privacyMode === nextProps.privacyMode,
);
