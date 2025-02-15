import { Token } from '@uniswap/sdk-core'
import { TokenList } from '@uniswap/token-lists'

import { Trans } from '@lingui/macro'
import { transparentize } from 'polished'
import { AlertCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'

import Card from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'
import ListLogo from 'legacy/components/ListLogo'
import { RowFixed } from 'legacy/components/Row'
import { ExternalLink, ThemedText } from 'legacy/theme'
import { getEtherscanLink as getExplorerLink } from 'legacy/utils'

import { useWalletInfo } from 'modules/wallet'

import { CurrencyLogo } from 'common/pure/CurrencyLogo'

const WarningWrapper = styled(Card)<{ highWarning: boolean }>`
  background-color: ${({ theme, highWarning }) =>
    highWarning ? transparentize(0.8, theme.red1) : transparentize(0.8, theme.yellow2)};
  width: fit-content;
`

const AddressText = styled(ThemedText.Blue)`
  font-size: 12px;
  word-break: break-all;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
  `}
`
interface TokenImportCardProps {
  list?: TokenList
  token: Token
}
const TokenImportCard = ({ list, token }: TokenImportCardProps) => {
  const theme = useTheme()
  const { chainId } = useWalletInfo()
  return (
    <Card backgroundColor={theme.bg4} padding="2rem">
      <AutoColumn gap="10px" justify="center">
        <CurrencyLogo currency={token} size={'32px'} />
        <AutoColumn gap="4px" justify="center">
          <ThemedText.Body ml="8px" mr="8px" fontWeight={500} fontSize={20}>
            {token.symbol}
          </ThemedText.Body>
          <ThemedText.DarkGray fontWeight={400} fontSize={14}>
            {token.name}
          </ThemedText.DarkGray>
        </AutoColumn>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, 'address', token.address)}>
            <AddressText fontSize={12}>{token.address}</AddressText>
          </ExternalLink>
        )}
        {list !== undefined ? (
          <RowFixed>
            {list.logoURI && <ListLogo logoURI={list.logoURI} size="16px" />}
            <ThemedText.Small ml="6px" fontSize={14} color={theme.text3}>
              <Trans>via {list.name} token list</Trans>
            </ThemedText.Small>
          </RowFixed>
        ) : (
          <WarningWrapper $borderRadius="4px" padding="4px" highWarning={true}>
            <RowFixed>
              <AlertCircle stroke={theme.red1} size="10px" />
              <ThemedText.Body color={theme.red1} ml="4px" fontSize="10px" fontWeight={500}>
                <Trans>Unknown Source</Trans>
              </ThemedText.Body>
            </RowFixed>
          </WarningWrapper>
        )}
      </AutoColumn>
    </Card>
  )
}

export default TokenImportCard
