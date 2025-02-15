import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'

import { getChainInfo } from 'legacy/constants/chainInfo'
import { ALL_SUPPORTED_CHAIN_IDS } from 'legacy/constants/chains'
import { ExternalLink } from 'legacy/theme'
import { getExplorerBaseUrl } from 'legacy/utils/explorer'

import * as styledEl from './styled'

export interface NetworksListProps {
  currentChainId: SupportedChainId | null

  onSelectChain(targetChainId: SupportedChainId): void
}

export function NetworksList(props: NetworksListProps) {
  const { currentChainId, onSelectChain } = props

  return (
    <>
      {ALL_SUPPORTED_CHAIN_IDS.map((targetChainId: SupportedChainId) => {
        const info = getChainInfo(targetChainId)
        const { label, logoUrl, bridge, explorer, explorerTitle, helpCenterUrl } = info

        const isActive = targetChainId === currentChainId

        const rowContent = (
          <styledEl.FlyoutRow key={targetChainId} onClick={() => onSelectChain(targetChainId)} active={isActive}>
            <styledEl.Logo src={logoUrl} />
            <styledEl.NetworkLabel>{label}</styledEl.NetworkLabel>
            {isActive && <styledEl.FlyoutRowActiveIndicator active />}
          </styledEl.FlyoutRow>
        )

        if (!isActive) {
          return rowContent
        }

        return (
          <styledEl.ActiveRowWrapper key={targetChainId}>
            {rowContent}
            <styledEl.ActiveRowLinkList>
              {bridge && (
                <ExternalLink href={bridge}>
                  <Trans>Bridge</Trans>
                  <styledEl.LinkOutCircle />
                </ExternalLink>
              )}
              {explorer && (
                <ExternalLink href={explorer}>
                  <Trans>{explorerTitle}</Trans>
                  <styledEl.LinkOutCircle />
                </ExternalLink>
              )}
              {helpCenterUrl && (
                <ExternalLink href={helpCenterUrl}>
                  <Trans>Help Center</Trans>
                  <styledEl.LinkOutCircle />
                </ExternalLink>
              )}

              <ExternalLink href={getExplorerBaseUrl(targetChainId)}>
                <Trans>CoW Protocol Explorer</Trans>
                <styledEl.LinkOutCircle />
              </ExternalLink>
            </styledEl.ActiveRowLinkList>
          </styledEl.ActiveRowWrapper>
        )
      })}
    </>
  )
}
