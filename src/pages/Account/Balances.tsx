import { useCallback, useEffect, useMemo, useState } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'

import ArrowIcon from 'legacy/assets/cow-swap/arrow.svg'
import CowImage from 'legacy/assets/cow-swap/cow_v2.svg'
import vCOWImage from 'legacy/assets/cow-swap/vCOW.png'
import { ButtonPrimary } from 'legacy/components/Button'
import CopyHelper from 'legacy/components/Copy'
import { MouseoverTooltipContent } from 'legacy/components/Tooltip'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { V_COW_CONTRACT_ADDRESS, COW_CONTRACT_ADDRESS } from 'legacy/constants'
import { COW, V_COW } from 'legacy/constants/tokens'
import { useErrorModal } from 'legacy/hooks/useErrorMessageAndModal'
import usePrevious from 'legacy/hooks/usePrevious'
import useTransactionConfirmationModal from 'legacy/hooks/useTransactionConfirmationModal'
import { SwapVCowStatus } from 'legacy/state/cowToken/actions'
import { useVCowData, useSwapVCowCallback, useSetSwapVCowStatus, useSwapVCowStatus } from 'legacy/state/cowToken/hooks'
import { getBlockExplorerUrl } from 'legacy/utils'
import { getProviderErrorMessage } from 'legacy/utils/misc'

import { useTokenBalance } from 'modules/tokens/hooks/useCurrencyBalance'
import { useWalletInfo } from 'modules/wallet'
import AddToMetamask from 'modules/wallet/web3-react/containers/AddToMetamask'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { HelpCircle } from 'common/pure/HelpCircle'
import { TokenAmount } from 'common/pure/TokenAmount'
import useBlockNumber from 'lib/hooks/useBlockNumber'
import { useCowFromLockedGnoBalances } from 'pages/Account/LockedGnoVesting/hooks'
import {
  ExtLink,
  Card,
  CardActions,
  BalanceDisplay,
  ConvertWrapper,
  VestingBreakdown,
  CardsLoader,
  CardsSpinner,
} from 'pages/Account/styled'

import LockedGnoVesting from './LockedGnoVesting'

// Number of blocks to wait before we re-enable the swap COW -> vCOW button after confirmation
const BLOCKS_TO_WAIT = 2

export default function Profile() {
  const { provider, connector } = useWeb3React()
  const { account, chainId } = useWalletInfo()
  const previousAccount = usePrevious(account)

  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const blockNumber = useBlockNumber()
  const [confirmationBlock, setConfirmationBlock] = useState<undefined | number>(undefined)
  const [shouldUpdate, setShouldUpdate] = useState<boolean>(false)

  const setSwapVCowStatus = useSetSwapVCowStatus()
  const swapVCowStatus = useSwapVCowStatus()

  const isMetaMask = (connector as MetaMask)?.provider?.isMetaMask

  // Locked GNO balance
  const { loading: isLockedGnoLoading, ...lockedGnoBalances } = useCowFromLockedGnoBalances()

  const cowToken = COW[chainId]
  const vCowToken = V_COW[chainId]
  // Cow balance
  const cow =
    useTokenBalance(account || undefined, chainId ? cowToken : undefined) || CurrencyAmount.fromRawAmount(cowToken, 0)

  // vCow balance values
  const { unvested, vested, total, isLoading: isVCowLoading } = useVCowData()

  // Boolean flags
  const hasVestedBalance = vested && !vested.equalTo(0)
  const hasVCowBalance = total && !total.equalTo(0)

  const isSwapPending = swapVCowStatus === SwapVCowStatus.SUBMITTED
  const isSwapInitial = swapVCowStatus === SwapVCowStatus.INITIAL
  const isSwapConfirmed = swapVCowStatus === SwapVCowStatus.CONFIRMED
  const isSwapDisabled = Boolean(
    !hasVestedBalance || !isSwapInitial || isSwapPending || isSwapConfirmed || shouldUpdate
  )

  const isCardsLoading = useMemo(() => {
    let output = isVCowLoading || isLockedGnoLoading || !provider

    // remove loader after 5 sec in any case
    setTimeout(() => {
      output = false
    }, 5000)

    return output
  }, [isLockedGnoLoading, isVCowLoading, provider])

  // Init modal hooks
  const { handleSetError, handleCloseError, ErrorModal } = useErrorModal()
  const { TransactionConfirmationModal, openModal, closeModal } = useTransactionConfirmationModal(
    ConfirmOperationType.CONVERT_VCOW
  )

  // Handle swaping
  const { swapCallback } = useSwapVCowCallback({
    openModal,
    closeModal,
  })

  const handleVCowSwap = useCallback(async () => {
    handleCloseError()

    if (!swapCallback) {
      return
    }

    setSwapVCowStatus(SwapVCowStatus.ATTEMPTING)

    swapCallback()
      .then(() => {
        setSwapVCowStatus(SwapVCowStatus.SUBMITTED)
      })
      .catch((error) => {
        console.error('[Profile::index::swapVCowCallback]::error', error)
        setSwapVCowStatus(SwapVCowStatus.INITIAL)
        handleSetError(getProviderErrorMessage(error))
      })
  }, [handleCloseError, handleSetError, setSwapVCowStatus, swapCallback])

  const tooltipText = {
    balanceBreakdown: (
      <VestingBreakdown>
        <span>
          <i>Unvested</i>{' '}
          <p>
            <TokenAmount amount={unvested} defaultValue="0" tokenSymbol={vCowToken} />
          </p>
        </span>
        <span>
          <i>Vested</i>{' '}
          <p>
            <TokenAmount amount={shouldUpdate ? undefined : vested} defaultValue="0" tokenSymbol={vCowToken} />
          </p>
        </span>
      </VestingBreakdown>
    ),
    vested: (
      <div>
        <p>
          <strong>Vested vCOW</strong> is the portion of your vCOW token balance, which is fully available to convert to
          COW token.
        </p>
        <p>
          This includes any vCOW received through an <strong>airdrop.</strong>
        </p>
        <p>When converting your vested vCOW balance to COW, your entire vested balance will be converted.</p>
      </div>
    ),
  }

  const renderConvertToCowContent = useCallback(() => {
    let content = null

    if (isSwapPending) {
      content = <span>Converting vCOW...</span>
    } else if (isSwapConfirmed) {
      content = <span>Successfully converted!</span>
    } else {
      content = (
        <>
          Convert to COW <SVG src={ArrowIcon} />
        </>
      )
    }

    return content
  }, [isSwapConfirmed, isSwapPending])

  // Fixes the issue with change in status after swap confirmation
  // Makes sure to wait 2 blocks after confirmation to enable the swap button again
  useEffect(() => {
    if (isSwapConfirmed && !confirmationBlock) {
      setConfirmationBlock(blockNumber)
      setShouldUpdate(true)
    }

    if (!confirmationBlock || !blockNumber) {
      return
    }

    if (isSwapConfirmed && blockNumber - confirmationBlock > BLOCKS_TO_WAIT && hasVestedBalance) {
      setSwapVCowStatus(SwapVCowStatus.INITIAL)
      setConfirmationBlock(undefined)
      setShouldUpdate(false)
    }
  }, [blockNumber, confirmationBlock, hasVestedBalance, isSwapConfirmed, setSwapVCowStatus, shouldUpdate])

  // Reset swap button status on account change
  useEffect(() => {
    if (account && previousAccount && account !== previousAccount && !isSwapInitial) {
      setSwapVCowStatus(SwapVCowStatus.INITIAL)
    }
  }, [account, isSwapInitial, previousAccount, setSwapVCowStatus])

  const currencyCOW = COW[chainId]

  return (
    <>
      <TransactionConfirmationModal />
      <ErrorModal />

      {isCardsLoading && !isProviderNetworkUnsupported ? (
        <Card>
          <CardsLoader>
            <CardsSpinner size="42px" />
          </CardsLoader>
        </Card>
      ) : (
        <>
          {hasVCowBalance && (
            <Card showLoader={isVCowLoading || isSwapPending}>
              <BalanceDisplay hAlign="left">
                <img src={vCOWImage} alt="vCOW token" width="56" height="56" />
                <span>
                  <i>
                    <Trans>Total vCOW balance</Trans>
                  </i>
                  <b>
                    <TokenAmount amount={total} defaultValue="0" tokenSymbol={vCowToken} />{' '}
                    <MouseoverTooltipContent content={tooltipText.balanceBreakdown} wrap>
                      <HelpCircle size={14} />
                    </MouseoverTooltipContent>
                  </b>
                </span>
              </BalanceDisplay>
              <ConvertWrapper>
                <BalanceDisplay titleSize={18} altColor={true}>
                  <i>
                    Vested{' '}
                    <MouseoverTooltipContent content={tooltipText.vested} wrap>
                      <HelpCircle size={14} />
                    </MouseoverTooltipContent>
                  </i>
                  <b>
                    <TokenAmount amount={shouldUpdate ? undefined : vested} defaultValue="0" />
                  </b>
                </BalanceDisplay>
                <ButtonPrimary onClick={handleVCowSwap} disabled={isSwapDisabled}>
                  {renderConvertToCowContent()}
                </ButtonPrimary>
              </ConvertWrapper>

              <CardActions>
                <ExtLink href={getBlockExplorerUrl(chainId, 'token', V_COW_CONTRACT_ADDRESS[chainId])}>
                  View contract ↗
                </ExtLink>
                <CopyHelper toCopy={V_COW_CONTRACT_ADDRESS[chainId]}>
                  <div title="Click to copy token contract address">Copy contract</div>
                </CopyHelper>
              </CardActions>
            </Card>
          )}

          <Card>
            <BalanceDisplay titleSize={26}>
              <img src={CowImage} alt="Cow Balance" height="80" width="80" />
              <span>
                <i>Available COW balance</i>
                <b>
                  {!isProviderNetworkUnsupported && (
                    <TokenAmount amount={cow} defaultValue="0" tokenSymbol={cowToken} />
                  )}
                </b>
              </span>
            </BalanceDisplay>
            <CardActions>
              <ExtLink
                title="View contract"
                href={getBlockExplorerUrl(chainId, 'token', COW_CONTRACT_ADDRESS[chainId])}
              >
                View contract ↗
              </ExtLink>

              {isMetaMask && !isProviderNetworkUnsupported && <AddToMetamask shortLabel currency={currencyCOW} />}

              {!isMetaMask && (
                <CopyHelper toCopy={COW_CONTRACT_ADDRESS[chainId]}>
                  <div title="Click to copy token contract address">Copy contract</div>
                </CopyHelper>
              )}

              <Link to={`/swap?outputCurrency=${COW_CONTRACT_ADDRESS[chainId]}`}>Buy COW</Link>
            </CardActions>
          </Card>

          <LockedGnoVesting
            {...lockedGnoBalances}
            loading={isLockedGnoLoading}
            openModal={openModal}
            closeModal={closeModal}
          />
        </>
      )}
    </>
  )
}
