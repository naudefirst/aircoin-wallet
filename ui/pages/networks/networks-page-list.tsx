import {
  type MultichainNetworkConfiguration,
} from '@metamask/multichain-network-controller';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  BoxFlexDirection,
  BoxJustifyContent,
  Button,
  ButtonVariant,
  Text,
  TextColor,
} from '@metamask/design-system-react';
import { useNetworkChangeHandlers } from '../../components/multichain/network-manager/hooks/useNetworkChangeHandlers';
import { useNetworkItemCallbacks } from '../../components/multichain/network-manager/hooks/useNetworkItemCallbacks';
import { NetworkListItem } from '../../components/multichain/network-list-item';
import { useI18nContext } from '../../hooks/useI18nContext';
import {
  getOrderedNetworksList,
} from '../../selectors/selectors';
import {
  convertCaipToHexChainId,
  getNetworkIcon,
  getRpcDataByChainId,
  sortNetworks,
} from '../../../shared/lib/network.utils';
import { CHAIN_IDS } from '../../../shared/constants/network';
import { useNetworkManagerState } from '../../components/multichain/network-manager/hooks/useNetworkManagerState';
import { getNetworkConfigurationsByChainId } from '../../../shared/lib/selectors/networks';

const filterNetworks = <
  NetworkRecord extends {
    name?: string;
    chainId?: string;
    nativeCurrency?: string;
  },
>(
  networks: NetworkRecord[],
  query: string,
) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return networks;
  }

  return networks.filter((network) =>
    [network.name, network.chainId, network.nativeCurrency]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );
};

const SectionDivider = () => <Box className="mx-4 border-t border-muted" />;

type NetworksPageListProps = {
  searchQuery: string;
  footerContent?: React.ReactNode;
};

export const NetworksPageList = ({
  searchQuery,
  footerContent,
}: NetworksPageListProps) => {
  const t = useI18nContext();
  const [, setSearchParams] = useSearchParams();

  const orderedNetworksList = useSelector(getOrderedNetworksList);
  const evmNetworks = useSelector(getNetworkConfigurationsByChainId);
  const { nonTestNetworks, isNetworkInDefaultNetworkTab } =
    useNetworkManagerState({
      showDefaultNetworks: true,
    });
  const { getItemCallbacks, hasMultiRpcOptions, isNetworkEnabled } =
    useNetworkItemCallbacks();
  const { handleNetworkChange } = useNetworkChangeHandlers();

  const orderedNetworks = useMemo(() => {
    const sorted = sortNetworks(nonTestNetworks, orderedNetworksList);
    const aircoinIndex = sorted.findIndex(
      (n) => convertCaipToHexChainId(n.chainId) === CHAIN_IDS.AIRCOIN,
    );
    if (aircoinIndex > 0) {
      const [aircoin] = sorted.splice(aircoinIndex, 1);
      sorted.unshift(aircoin);
    }
    return filterNetworks(sorted, searchQuery);
  }, [nonTestNetworks, orderedNetworksList, searchQuery]);

  const defaultNetworks = useMemo(
    () => orderedNetworks.filter(isNetworkInDefaultNetworkTab),
    [isNetworkInDefaultNetworkTab, orderedNetworks],
  );

  const customNetworks = useMemo(
    () =>
      orderedNetworks.filter(
        (network) => !isNetworkInDefaultNetworkTab(network),
      ),
    [isNetworkInDefaultNetworkTab, orderedNetworks],
  );

  const renderNetworkListItem = useCallback(
    (network: MultichainNetworkConfiguration) => {
      const { onDelete, onEdit, onDiscoverClick, onRpcSelect } =
        getItemCallbacks(network);

      return (
        <NetworkListItem
          key={network.chainId}
          chainId={network.chainId}
          name={network.name}
          iconSrc={getNetworkIcon(network)}
          focus={false}
          selected={false}
          rpcEndpoint={
            network.isEvm && hasMultiRpcOptions(network)
              ? getRpcDataByChainId(network.chainId, evmNetworks)
                  .defaultRpcEndpoint
              : undefined
          }
          onClick={() => handleNetworkChange(network.chainId)}
          onDeleteClick={onDelete}
          onEditClick={onEdit}
          onDiscoverClick={onDiscoverClick}
          onRpcEndpointClick={onRpcSelect}
          disabled={!isNetworkEnabled(network)}
          notSelectable={false}
        />
      );
    },
    [
      evmNetworks,
      getItemCallbacks,
      handleNetworkChange,
      hasMultiRpcOptions,
      isNetworkEnabled,
    ],
  );

  return (
    <Box
      className="flex h-full min-h-0 w-full flex-col"
      data-testid="networks-page-list"
    >
      <Box className="flex-1 overflow-y-auto pt-2">
        {defaultNetworks.length > 0 ? (
          <Box
            padding={4}
            paddingBottom={2}
            flexDirection={BoxFlexDirection.Row}
            justifyContent={BoxJustifyContent.Between}
          >
            <Text color={TextColor.TextAlternative}>
              {t('defaultNetworks')}
            </Text>
          </Box>
        ) : null}

        <Box>{defaultNetworks.map(renderNetworkListItem)}</Box>

        {customNetworks.length > 0 ? (
          <>
            <SectionDivider />
            <Box
              padding={4}
              paddingBottom={2}
              flexDirection={BoxFlexDirection.Row}
              justifyContent={BoxJustifyContent.Between}
            >
              <Text color={TextColor.TextAlternative}>
                {t('customNetworks')}
              </Text>
            </Box>
          </>
        ) : null}

        <Box>{customNetworks.map(renderNetworkListItem)}</Box>

      </Box>

      <Box padding={4} gap={4} flexDirection={BoxFlexDirection.Column}>
        {footerContent}
        <Button
          className="w-full"
          variant={ButtonVariant.Secondary}
          onClick={() => setSearchParams({ view: 'add' })}
          data-testid="networks-page-add-custom-network-button"
        >
          {t('addACustomNetwork')}
        </Button>
      </Box>
    </Box>
  );
};
