import { CaipChainId, Hex } from '@metamask/utils';
import React, { memo, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BtcScope, EthScope, SolScope, TrxScope } from '@metamask/keyring-api';
import {
  convertCaipToHexChainId,
  getNetworkIcon,
  getRpcDataByChainId,
  sortNetworks,
} from '../../../../../../shared/lib/network.utils';
import {
  AlignItems,
  BlockSize,
  Display,
  FlexDirection,
  JustifyContent,
  TextColor,
  TextVariant,
} from '../../../../../helpers/constants/design-system';
import {
  setEnabledAllPopularNetworks,
  hideModal,
  setActiveNetwork,
} from '../../../../../store/actions';
import {
  AvatarNetworkSize,
  Box,
  IconName,
  IconSize,
  Text,
} from '../../../../component-library';
import { NetworkListItem } from '../../../network-list-item';
import { useNetworkChangeHandlers } from '../../hooks/useNetworkChangeHandlers';
import { useNetworkItemCallbacks } from '../../hooks/useNetworkItemCallbacks';
import { useNetworkManagerState } from '../../hooks/useNetworkManagerState';
import { getMultichainIsEvm } from '../../../../../selectors/multichain';
import {
  getAllEnabledNetworksForAllNamespaces,
  getSelectedMultichainNetworkConfiguration,
} from '../../../../../selectors/multichain/networks';
import { useI18nContext } from '../../../../../hooks/useI18nContext';
import {
  getOrderedNetworksList,
  getMultichainNetworkConfigurationsByChainId,
  getUseExternalServices,
} from '../../../../../selectors';
import { getInternalAccountBySelectedAccountGroupAndCaip } from '../../../../../selectors/multichain-accounts/account-tree';
import { isEvmChainId } from '../../../../../../shared/lib/asset-utils';
import { CHAIN_IDS } from '../../../../../../shared/constants/network';

const DefaultNetworks = memo(() => {
  const t = useI18nContext();
  const dispatch = useDispatch();
  const orderedNetworksList = useSelector(getOrderedNetworksList);
  const [, evmNetworks] = useSelector(
    getMultichainNetworkConfigurationsByChainId,
  );
  const allEnabledNetworksForAllNamespaces = useSelector(
    getAllEnabledNetworksForAllNamespaces,
  );
  // Use the shared callbacks hook
  const { getItemCallbacks, hasMultiRpcOptions } = useNetworkItemCallbacks();

  // Use the shared network change handlers hook
  const { handleNetworkChange } = useNetworkChangeHandlers();

  const isEvmNetworkSelected = useSelector(getMultichainIsEvm);

  const useExternalServices = useSelector(getUseExternalServices);

  // Get the currently selected network to allow it through when BFT is OFF
  const currentNetwork = useSelector(getSelectedMultichainNetworkConfiguration);
  const selectedNonEvmChainId =
    !isEvmNetworkSelected && currentNetwork ? currentNetwork.chainId : null;

  // extract the evm account of the selected account group
  const evmAccountGroup = useSelector((state) =>
    getInternalAccountBySelectedAccountGroupAndCaip(state, EthScope.Eoa),
  );

  const enabledChainIds = useSelector(getAllEnabledNetworksForAllNamespaces);

  // extract the solana account of the selected account group
  const solAccountGroup = useSelector((state) =>
    getInternalAccountBySelectedAccountGroupAndCaip(state, SolScope.Mainnet),
  );

  const btcAccountGroup = useSelector((state) =>
    getInternalAccountBySelectedAccountGroupAndCaip(state, BtcScope.Mainnet),
  );

  const trxAccountGroup = useSelector((state) =>
    getInternalAccountBySelectedAccountGroupAndCaip(state, TrxScope.Mainnet),
  );

  // Use the shared state hook
  const { nonTestNetworks, isNetworkInDefaultNetworkTab } =
    useNetworkManagerState({ showDefaultNetworks: true });

  // Memoize sorted networks to avoid expensive sorting on every render
  const orderedNetworks = useMemo(() => {
    // Filter nonTestNetworks object based on basic functionality toggle
    // Exception: Keep the currently selected non-EVM chain visible
    const filteredNetworks = useExternalServices
      ? nonTestNetworks
      : Object.fromEntries(
          Object.entries(nonTestNetworks).filter(
            ([, network]) =>
              isEvmChainId(network.chainId as `0x${string}`) ||
              network.chainId === selectedNonEvmChainId,
          ),
        );
    const sorted = sortNetworks(filteredNetworks, orderedNetworksList);
    // Pin AirCoin to the top of the default networks list
    const aircoinIndex = sorted.findIndex(
      (n) => convertCaipToHexChainId(n.chainId) === CHAIN_IDS.AIRCOIN,
    );
    if (aircoinIndex > 0) {
      const [aircoin] = sorted.splice(aircoinIndex, 1);
      sorted.unshift(aircoin);
    }
    return sorted;
  }, [
    nonTestNetworks,
    orderedNetworksList,
    useExternalServices,
    selectedNonEvmChainId,
  ]);

  const isAllPopularNetworksSelected = useMemo(
    () => allEnabledNetworksForAllNamespaces.length > 1,
    [allEnabledNetworksForAllNamespaces],
  );

  const isSingleNetworkSelected = useCallback(
    (hexChainId: Hex) => {
      return (
        !isAllPopularNetworksSelected &&
        allEnabledNetworksForAllNamespaces.length === 1 &&
        allEnabledNetworksForAllNamespaces[0] === hexChainId
      );
    },
    [isAllPopularNetworksSelected, allEnabledNetworksForAllNamespaces],
  );

  // Use useCallback for stable function references
  const selectAllDefaultNetworks = useCallback(() => {
    const evmNetworksList = orderedNetworks.filter((network) => network.isEvm);

    if (evmNetworksList.length === 0) {
      return;
    }

    // Use the first EVM network's chain ID for getting RPC data
    const firstEvmChainId = evmNetworksList[0].chainId;
    const { defaultRpcEndpoint } = getRpcDataByChainId(
      firstEvmChainId,
      evmNetworks,
    );
    const finalNetworkClientId = defaultRpcEndpoint.networkClientId;

    dispatch(setEnabledAllPopularNetworks());
    dispatch(hideModal());
    // deferring execution to keep select all unblocked
    setTimeout(() => {
      dispatch(setActiveNetwork(finalNetworkClientId));
    }, 0);
  }, [dispatch, evmNetworks, orderedNetworks]);

  // Memoize the network change handler to avoid recreation
  const handleNetworkChangeCallback = useCallback(
    async (chainId: CaipChainId, isLastRemainingNetwork: boolean) => {
      if (isLastRemainingNetwork) {
        return;
      }

      await handleNetworkChange(chainId);
    },
    [handleNetworkChange],
  );

  // Memoize the network list items to avoid recreation on every render
  const networkListItems = useMemo(() => {
    // Helper function to filter networks based on account type and selection
    const getFilteredNetworks = () => {
      return orderedNetworks.filter((network) => {
        // Show EVM networks if user has EVM accounts
        if (evmAccountGroup && network.isEvm) {
          return true;
        }
        // When basic functionality toggle is OFF, only show EVM networks
        // Exception: Keep the currently selected non-EVM chain visible
        if (!useExternalServices) {
          return network.chainId === selectedNonEvmChainId;
        }
        if (solAccountGroup && network.chainId === SolScope.Mainnet) {
          return true;
        }
        if (btcAccountGroup && network.chainId === BtcScope.Mainnet) {
          return true;
        }
        if (trxAccountGroup && network.chainId === TrxScope.Mainnet) {
          return true;
        }
        return false;
      });
    };

    const filteredNetworks = getFilteredNetworks();

    return filteredNetworks.map((network) => {
      const networkChainId = network.chainId; // eip155:59144
      // Convert CAIP format to hex format for comparison
      const hexChainId = network.isEvm
        ? convertCaipToHexChainId(networkChainId)
        : networkChainId;

      if (!isNetworkInDefaultNetworkTab(network)) {
        return null;
      }

      const { onDelete, onEdit, onDiscoverClick, onRpcSelect } =
        getItemCallbacks(network);
      const iconSrc = getNetworkIcon(network);
      const isSelected = isSingleNetworkSelected(hexChainId as Hex);

      const singleRemainingNetwork = enabledChainIds.length === 1;
      const isLastRemainingNetwork =
        singleRemainingNetwork && enabledChainIds[0] === hexChainId;

      return (
        <NetworkListItem
          key={network.chainId}
          chainId={network.chainId}
          name={network.name}
          iconSrc={iconSrc}
          iconSize={AvatarNetworkSize.Md}
          focus={false}
          rpcEndpoint={
            hasMultiRpcOptions(network)
              ? getRpcDataByChainId(network.chainId, evmNetworks)
                  .defaultRpcEndpoint
              : undefined
          }
          onClick={async () => {
            await handleNetworkChangeCallback(
              network.chainId,
              isLastRemainingNetwork,
            );
            await dispatch(hideModal());
          }}
          onDeleteClick={onDelete}
          onEditClick={onEdit}
          onDiscoverClick={onDiscoverClick}
          onRpcEndpointClick={onRpcSelect}
          selected={isSelected}
        />
      );
    });
  }, [
    orderedNetworks,
    isNetworkInDefaultNetworkTab,
    getItemCallbacks,
    isSingleNetworkSelected,
    hasMultiRpcOptions,
    evmNetworks,
    handleNetworkChangeCallback,
    btcAccountGroup,
    solAccountGroup,
    trxAccountGroup,
    evmAccountGroup,
    dispatch,
    enabledChainIds,
    useExternalServices,
    selectedNonEvmChainId,
  ]);

  return (
    <>
      <Box display={Display.Flex} flexDirection={FlexDirection.Column}>
        <Box
          className="network-manager__all-popular-networks"
          data-testid="network-manager-select-all"
        >
          <NetworkListItem
            name={t('allPopularNetworks')}
            onClick={selectAllDefaultNetworks}
            iconSrc={IconName.Global}
            iconSize={IconSize.Xl}
            selected={isAllPopularNetworksSelected}
            focus={false}
          />
        </Box>
        {networkListItems}
      </Box>
    </>
  );
});

DefaultNetworks.displayName = 'DefaultNetworks';

export { DefaultNetworks };
