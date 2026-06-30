import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  TextButton,
  TextButtonSize,
  TextVariant,
  TextColor,
  BoxFlexDirection,
  BoxAlignItems,
} from '@metamask/design-system-react';

import { Tag } from '../../../components/component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { SUPPORT_LINK } from '../../../helpers/constants/common';
import { isBeta } from '../../../../shared/lib/build-types';
import {
  MetaMetricsContextProp,
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import { Divider } from '../shared';

export default function AboutInfo(): React.ReactElement {
  const t = useI18nContext();
  const { trackEvent } = useContext(MetaMetricsContext);

  const version = process.env.METAMASK_VERSION ?? '';

  const handleContactUsClick = useCallback(() => {
    trackEvent(
      {
        category: MetaMetricsEventCategory.Settings,
        event: MetaMetricsEventName.SupportLinkClicked,
        properties: {
          url: SUPPORT_LINK,
        },
      },
      {
        contextPropsIntoEventProperties: [MetaMetricsContextProp.PageTitle],
      },
    );
  }, [trackEvent]);

  function renderInfoLinks(): React.ReactElement {
    const privacyUrl = 'https://pages.myairdrive.com/root/aircoin-lagals/privacy.html';
    const siteUrl = 'https://metamask.io/';

    const linkProps = {
      size: TextButtonSize.BodyMd,
      className:
        'w-full justify-start text-default !bg-transparent p-0 text-left',
    };

    const linkItemProps = {
      paddingTop: 3 as const,
      paddingBottom: 3 as const,
      className: 'w-full',
    };

    return (
      <Box
        flexDirection={BoxFlexDirection.Column}
        alignItems={BoxAlignItems.Start}
        className="w-full"
      >
        <Box {...linkItemProps}>
          <TextButton asChild {...linkProps}>
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
              {t('privacyMsg')}
            </a>
          </TextButton>
        </Box>
        <Box {...linkItemProps}>
          <TextButton asChild {...linkProps}>
            <a
              href="https://pages.myairdrive.com/root/aircoin-lagals/terms.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('terms')}
            </a>
          </TextButton>
        </Box>
        {isBeta() ? (
          <Box {...linkItemProps}>
            <TextButton asChild {...linkProps}>
              <a
                href="https://metamask.io/beta-terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('betaTerms')} <Tag label={t('new')} />
              </a>
            </TextButton>
          </Box>
        ) : null}
        <Box {...linkItemProps}>
          <TextButton asChild {...linkProps}>
            <a
              href="https://raw.githubusercontent.com/MetaMask/metamask-extension/main/attribution.txt"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('attributions')}
            </a>
          </TextButton>
        </Box>
        <Divider />
        <Box {...linkItemProps}>
          <TextButton asChild {...linkProps}>
            <a
              href="https://support.metamask.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('supportCenter')}
            </a>
          </TextButton>
        </Box>
        <Box {...linkItemProps}>
          <TextButton asChild {...linkProps}>
            <a href={siteUrl} target="_blank" rel="noopener noreferrer">
              {t('visitWebSite')}
            </a>
          </TextButton>
        </Box>
        <Box {...linkItemProps}>
          <TextButton asChild {...linkProps}>
            <a
              href={SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleContactUsClick}
            >
              {t('contactUs')}
            </a>
          </TextButton>
        </Box>
      </Box>
    );
  }

  const versionLabel = isBeta()
    ? t('betaMetamaskVersion')
    : t('metamaskVersion');

  return (
    <Box
      flexDirection={BoxFlexDirection.Column}
      alignItems={BoxAlignItems.Center}
      paddingTop={3}
      paddingBottom={6}
      gap={4}
      paddingHorizontal={4}
    >
      <Box>
        <img
          src="./images/logo/aircoin-logo.png"
          alt="AIR Wallet Logo"
          className="info-tab__logo w-24 h-24"
        />
      </Box>
      
      {renderInfoLinks()}
    </Box>
  );
}
