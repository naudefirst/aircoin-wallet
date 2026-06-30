import React, { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../../shared/constants/metametrics';
import { trace, TraceName } from '../../../../../shared/lib/trace';
import { MetaMetricsContext } from '../../../../contexts/metametrics';
import { getMultichainIsEvm } from '../../../../selectors/multichain';
import { usePrimaryCurrencyProperties } from '../hooks';
import TokenList from '../token-list';
import AssetListControlBar from './asset-list-control-bar';

export type AssetListProps = {
  onClickAsset: (chainId: string, address: string) => void;
  showTokensLinks?: boolean;
};

const TokenListContainer = React.memo(
  ({
    onClickAsset,
  }: Pick<AssetListProps, 'onClickAsset'>) => {
    const { trackEvent } = useContext(MetaMetricsContext);
    const { primaryCurrencyProperties } = usePrimaryCurrencyProperties();

    const onTokenClick = useCallback(
      (chainId: string, tokenAddress: string) => {
        trace({ name: TraceName.AssetDetails });
        onClickAsset(chainId, tokenAddress);
        trackEvent({
          event: MetaMetricsEventName.TokenScreenOpened,
          category: MetaMetricsEventCategory.Navigation,
          properties: {
            // TODO: Fix in https://github.com/MetaMask/metamask-extension/issues/31860
            // eslint-disable-next-line @typescript-eslint/naming-convention
            token_symbol: primaryCurrencyProperties.suffix,
            location: 'Home',
          },
        });
      },
      [],
    );

    return <TokenList onTokenClick={onTokenClick} />;
  },
);

const AssetList = ({
  onClickAsset,
  showTokensLinks,
}: AssetListProps) => {
  const isEvm = useSelector(getMultichainIsEvm);
  const shouldShowTokensLinks = showTokensLinks ?? isEvm;

  return (
    <>
      <AssetListControlBar showTokensLinks={shouldShowTokensLinks} />
      <TokenListContainer onClickAsset={onClickAsset} />
    </>
  );
};

export default AssetList;
