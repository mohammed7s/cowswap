import { useAtomValue } from 'jotai'

import { useIsSafeWallet, useWalletInfo } from 'modules/wallet'

import { CowModal } from 'common/pure/Modal'
import { OrderSubmittedContent } from 'common/pure/OrderSubmittedContent'
import { TransactionErrorContent } from 'common/pure/TransactionErrorContent'

import { TradeConfirmPendingContent } from './TradeConfirmPendingContent'

import { useTradeConfirmActions } from '../../hooks/useTradeConfirmActions'
import { tradeConfirmStateAtom } from '../../state/tradeConfirmStateAtom'

export interface TradeConfirmModalProps {
  children: JSX.Element
}

export function TradeConfirmModal(props: TradeConfirmModalProps) {
  const { children } = props

  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { isOpen, pendingTrade, transactionHash, error } = useAtomValue(tradeConfirmStateAtom)
  const { onDismiss } = useTradeConfirmActions()

  if (!account) return null

  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss}>
      {(() => {
        if (error) {
          return <TransactionErrorContent message={error} onDismiss={onDismiss} />
        }

        if (pendingTrade) {
          return <TradeConfirmPendingContent pendingTrade={pendingTrade} onDismiss={onDismiss} />
        }

        // TODO: use <TransactionSubmittedContent/> for Swap
        if (transactionHash) {
          return (
            <OrderSubmittedContent
              chainId={chainId}
              account={account}
              isSafeWallet={isSafeWallet}
              onDismiss={onDismiss}
              hash={transactionHash}
            />
          )
        }

        return children
      })()}
    </CowModal>
  )
}
