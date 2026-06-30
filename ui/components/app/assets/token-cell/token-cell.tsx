import type { Hex } from '@metamask/utils';
import React, { useMemo } from 'react';
import { useMusdBalance, useMusdCtaVisibility } from '../../../../hooks/musd';
import { useI18nContext } from '../../../../hooks/useI18nContext';
import { ClaimBonusBadge, MusdConvertLink, useMerklRewards } from '../../musd';
import { getBonusAmountRange } from '../../musd/merkl-bonus-analytics';
import type {
  MerklClaimBonusAnalyticsLocation,
  MusdConvertLinkEntryPoint,
} from '../../musd/musd-events';
import { AssetCellBadge } from '../asset-list/cells/asset-cell-badge';
import GenericAssetCellLayout from '../asset-list/cells/generic-asset-cell-layout';
import { useTokenDisplayInfo } from '../hooks';
import { type TokenWithFiatAmount } from '../types';
import {
  TokenCellPercentChange,
  TokenCellPrimaryDisplay,
  TokenCellSecondaryDisplay,
  TokenCellTitle,
} from './cells';

export type TokenCellMusdOptions = {
  /** When set, enables Merkl fetch/badge for this cell. */
  merklClaimBonus?: { location: MerklClaimBonusAnalyticsLocation };
  /** When set, enables footer convert link (subject to `useMusdCtaVisibility` / balance rules). */
  convert?: { entryPoint: MusdConvertLinkEntryPoint };
};

export type TokenCellProps = {
  token: TokenWithFiatAmount;
  privacyMode?: boolean;
  onClick?: () => void;
  fixCurrencyToUSD?: boolean;
  /** Merkl claim bonus and/or mUSD convert surfaces; parent must pass explicit analytics locations. */
  musd?: TokenCellMusdOptions;
};

// TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
// eslint-disable-next-line @typescript-eslint/naming-convention
export default function TokenCell({
  token,
  privacyMode = false,
  onClick,
  fixCurrencyToUSD = false,
  musd,
}: TokenCellProps) {
  const t = useI18nContext();

  const showMerklBadge = Boolean(musd?.merklClaimBonus);

  // Check whether there are rewards available for the user
  const {
    hasClaimableReward,
    isEligible,
    hasClaimedBefore,
    claimableRewardDisplay,
    refetch: refetchMerklRewards,
  } = useMerklRewards({
    tokenAddress: token.address,
    chainId: token.chainId as Hex,
    showMerklBadge,
  });

  const { shouldShowTokenListItemCta } = useMusdCtaVisibility();
  const { hasMusdBalance } = useMusdBalance();

  const showMusdCta = useMemo(() => {
    if (!musd?.convert || !token.address || !token.chainId) {
      return false;
    }
    return shouldShowTokenListItemCta(
      {
        address: token.address as Hex,
        chainId: token.chainId as Hex,
        symbol: token.symbol,
      },
      { hasMusdBalance },
    );
  }, [
    musd?.convert,
    token.address,
    token.chainId,
    token.symbol,
    shouldShowTokenListItemCta,
    hasMusdBalance,
  ]);

  const tokenDisplayInfo = useTokenDisplayInfo({
    token,
    fixCurrencyToUSD,
  });

  const displayToken = useMemo(
    () => ({
      ...token,
      ...tokenDisplayInfo,
    }),
    [token, tokenDisplayInfo],
  );

  const merklBonusAmountRange = useMemo(
    () => getBonusAmountRange(claimableRewardDisplay ?? '< 0.01'),
    [claimableRewardDisplay],
  );

  const renderFooterLeft = () => {
    if (showMusdCta && musd?.convert) {
      return (
        <MusdConvertLink
          tokenAddress={token.address as Hex}
          chainId={token.chainId as Hex}
          tokenSymbol={token.symbol}
          entryPoint={musd.convert.entryPoint}
        />
      );
    }
    if (musd?.merklClaimBonus && isEligible && hasClaimableReward) {
      return (
        <ClaimBonusBadge
          tokenAddress={token.address as string}
          chainId={token.chainId as Hex}
          label={t('merklRewardsClaimBonus')}
          refetchRewards={refetchMerklRewards}
          analyticsLocation={musd.merklClaimBonus.location}
          assetSymbol={token.symbol}
          bonusAmountRange={merklBonusAmountRange}
          hasClaimedBefore={hasClaimedBefore}
        />
      );
    }
    return <TokenCellPercentChange token={displayToken} />;
  };

  if (!token.chainId) {
    return null;
  }

  return (
      <GenericAssetCellLayout
        onClick={onClick}
        badge={
          <AssetCellBadge
            chainId={token.chainId}
            isNative={token.isNative}
            tokenImage={displayToken.tokenImage}
            symbol={token.symbol}
            assetId={token.assetId}
          />
        }
        headerLeftDisplay={<TokenCellTitle token={displayToken} />}
        headerRightDisplay={
          <TokenCellSecondaryDisplay
            token={displayToken}
            privacyMode={privacyMode}
          />
        }
        footerLeftDisplay={renderFooterLeft()}
        footerRightDisplay={
          <TokenCellPrimaryDisplay
            token={displayToken}
            privacyMode={privacyMode}
          />
        }
      />
  );
}
