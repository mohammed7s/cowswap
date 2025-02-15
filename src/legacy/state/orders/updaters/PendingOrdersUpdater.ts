import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { EthflowData, OrderClass, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { GetSafeInfo, useGetSafeInfo } from 'legacy/hooks/useGetSafeInfo'
import { FulfillOrdersBatchParams, Order, OrderFulfillmentData, OrderStatus } from 'legacy/state/orders/actions'
import { LIMIT_OPERATOR_API_POLL_INTERVAL, MARKET_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import {
  AddOrUpdateOrdersCallback,
  CancelOrdersBatchCallback,
  ExpireOrdersBatchCallback,
  FulfillOrdersBatchCallback,
  PresignOrdersCallback,
  UpdatePresignGnosisSafeTxCallback,
  useAddOrUpdateOrders,
  useCancelOrdersBatch,
  useCombinedPendingOrders,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  usePresignOrders,
  useUpdatePresignGnosisSafeTx,
} from 'legacy/state/orders/hooks'
import { fetchOrderPopupData, OrderLogPopupMixData } from 'legacy/state/orders/updaters/utils'
import { OrderTransitionStatus } from 'legacy/state/orders/utils'
import { isOrderInPendingTooLong, openNpsAppziSometimes } from 'legacy/utils/appzi'
import { getExplorerOrderLink } from 'legacy/utils/explorer'

import { useAddOrderToSurplusQueue } from 'modules/swap/state/surplusModal'
import { useWalletInfo } from 'modules/wallet'

import { getOrder, OrderID } from 'api/gnosisProtocol'
import { removeOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useTriggerTotalSurplusUpdateCallback } from 'common/state/totalSurplusState'
import { timeSinceInSeconds } from 'utils/time'

/**
 * Return the ids of the orders that we are not yet aware that are signed.
 * This is, pre-sign orders, in state of "PRESIGNATURE_PENDING", for which we now know they are signed
 *
 * Used as an auxiliar method to detect which orders we should mark as pre-signed, so we change their state
 *
 * @param allPendingOrders All pending orders
 * @param signedOrdersIds ids of orders we know are already pre-signed
 * @returns ids of the pending orders that were pending for pre-sign, and we now know are pre-signed
 */
function _getNewlyPreSignedOrders(allPendingOrders: Order[], signedOrdersIds: OrderID[]) {
  return allPendingOrders
    .filter((order) => order.status === OrderStatus.PRESIGNATURE_PENDING && signedOrdersIds.includes(order.id))
    .map((order) => order.id)
}

/**
 *
 * Update the presign Gnosis Safe Tx information (if applies)
 */
async function _updatePresignGnosisSafeTx(
  chainId: ChainId,
  allPendingOrders: Order[],
  getSafeInfo: GetSafeInfo,
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback
) {
  const getSafeTxPromises = allPendingOrders
    // Update orders that are pending for presingature
    .filter((order) => order.presignGnosisSafeTxHash && order.status === OrderStatus.PRESIGNATURE_PENDING)
    .map((order): Promise<void> => {
      // Get safe info and receipt
      const presignGnosisSafeTxHash = order.presignGnosisSafeTxHash as string
      console.log('[PendingOrdersUpdater] Get Gnosis Transaction info for tx:', presignGnosisSafeTxHash)

      const { promise: safeTransactionPromise } = getSafeInfo(presignGnosisSafeTxHash)

      // Get safe info
      return safeTransactionPromise
        .then((safeTransaction) => {
          console.log('[PendingOrdersUpdater] Update Gnosis Safe transaction info: ', safeTransaction)
          updatePresignGnosisSafeTx({ orderId: order.id, chainId, safeTransaction })
        })
        .catch((error) => {
          if (!error.isCancelledError) {
            console.error(
              `[PendingOrdersUpdater] Failed to check Gnosis Safe tx hash: ${presignGnosisSafeTxHash}`,
              error
            )
          }
        })
    })

  await Promise.all(getSafeTxPromises)
}

async function _updateCreatingOrders(
  chainId: ChainId,
  pendingOrders: Order[],
  addOrUpdateOrders: AddOrUpdateOrdersCallback
): Promise<void> {
  const promises = pendingOrders.reduce<Promise<void>[]>((acc, order) => {
    if (order.status === OrderStatus.CREATING) {
      // Filter only EthFlow orders in creating state

      const promise = getOrder(chainId, order.id)
        .then((orderData) => {
          console.debug(`[PendingOrdersUpdater] ETH FLOW order ${order.id} fetched from API!!!`, orderData)
          if (!orderData) {
            return
          }
          // Hack, because Swagger doesn't have isRefunded property and backend is going to delete it soon
          const ethflowData: (EthflowData & { isRefunded?: boolean }) | undefined = orderData.ethflowData

          const updatedOrder = {
            ...order,
            validTo: orderData.ethflowData?.userValidTo || order.validTo,
            isRefunded: ethflowData?.isRefunded,
            refundHash: ethflowData?.refundTxHash || undefined,
            openSince: Date.now(),
            status: OrderStatus.PENDING, // seen once, can be moved to pending bucket
            apiAdditionalInfo: orderData,
          }
          addOrUpdateOrders({ chainId, orders: [updatedOrder] })
        })
        .catch((error) => {
          // Nothing to do here, keep waiting until the order shows up
          console.debug(`[PendingOrdersUpdater] ETH FLOW order ${order.id} couldn't be fetched from API`, error)
        })

      acc.push(promise)
    }

    return acc
  }, [])

  await Promise.all(promises)
}

interface UpdateOrdersParams {
  account: string
  chainId: ChainId
  orders: Order[]
  // Actions
  addOrUpdateOrders: AddOrUpdateOrdersCallback
  fulfillOrdersBatch: FulfillOrdersBatchCallback
  expireOrdersBatch: ExpireOrdersBatchCallback
  cancelOrdersBatch: CancelOrdersBatchCallback
  presignOrders: PresignOrdersCallback
  addOrderToSurplusQueue: (orderId: string) => void
  triggerTotalSurplusUpdate: (() => void) | null
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback
  getSafeInfo: GetSafeInfo
}

async function _updateOrders({
  account,
  chainId,
  orders,
  // Actions
  addOrUpdateOrders,
  fulfillOrdersBatch,
  expireOrdersBatch,
  cancelOrdersBatch,
  presignOrders,
  addOrderToSurplusQueue,
  triggerTotalSurplusUpdate,
  updatePresignGnosisSafeTx,
  getSafeInfo,
}: UpdateOrdersParams): Promise<void> {
  // Only check pending orders of current connected account
  const lowerCaseAccount = account.toLowerCase()
  const pending = orders.filter(({ owner }) => owner.toLowerCase() === lowerCaseAccount)

  // Exit early when there are no pending orders
  if (!pending.length) {
    return
  } else {
    _triggerNps(pending, chainId)
  }

  // Iterate over pending orders fetching API data
  const unfilteredOrdersData = await Promise.all(
    pending.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
  )

  // Group resolved promises by status
  // Only pick the status that are final
  const { fulfilled, expired, cancelled, presigned } = unfilteredOrdersData.reduce<
    Record<OrderTransitionStatus, OrderLogPopupMixData[]>
  >(
    (acc, orderData) => {
      if (orderData && orderData.popupData) {
        acc[orderData.status].push(orderData.popupData)
      }
      return acc
    },
    { fulfilled: [], expired: [], cancelled: [], unknown: [], presigned: [], pending: [], presignaturePending: [] }
  )

  if (presigned.length > 0) {
    // Only mark as presigned the orders we were not aware of their new state
    const presignedOrderIds = presigned as OrderID[]
    const ordersPresignaturePendingSigned = _getNewlyPreSignedOrders(orders, presignedOrderIds)

    if (ordersPresignaturePendingSigned.length > 0) {
      presignOrders({
        ids: ordersPresignaturePendingSigned,
        chainId,
      })
    }
  }

  if (expired.length > 0) {
    expireOrdersBatch({
      ids: expired as OrderID[],
      chainId,
    })
  }

  if (cancelled.length > 0) {
    cancelOrdersBatch({
      ids: cancelled as OrderID[],
      chainId,
    })
  }

  if (fulfilled.length > 0) {
    const fulfilledOrders = fulfilled as OrderFulfillmentData[]
    // update redux state
    fulfillOrdersBatch({
      ordersData: fulfilledOrders,
      chainId,
    })
    // add to surplus queue
    fulfilledOrders.forEach(({ id, apiAdditionalInfo }) => {
      if (!apiAdditionalInfo || apiAdditionalInfo.class === OrderClass.MARKET) {
        addOrderToSurplusQueue(id)
      }
    })
    // trigger total surplus update
    triggerTotalSurplusUpdate?.()
  }

  // Update the presign Gnosis Safe Tx info (if applies)
  await _updatePresignGnosisSafeTx(chainId, orders, getSafeInfo, updatePresignGnosisSafeTx)
  // Update the creating EthFlow orders (if any)
  await _updateCreatingOrders(chainId, orders, addOrUpdateOrders)
}

// Check if there is any order pending for a long time
// If so, trigger appzi
function _triggerNps(pending: Order[], chainId: ChainId) {
  for (const order of pending) {
    const { openSince, id: orderId } = order
    // Check if there's any MARKET pending for more than `PENDING_TOO_LONG_TIME`
    if (order.class === OrderClass.MARKET && isOrderInPendingTooLong(openSince)) {
      const explorerUrl = getExplorerOrderLink(chainId, orderId)
      // Trigger NPS display, controlled by Appzi
      openNpsAppziSometimes({
        waitedTooLong: true,
        secondsSinceOpen: timeSinceInSeconds(openSince),
        explorerUrl,
        chainId,
      })
      // Break the loop, don't need to show more than once
      break
    }
  }
}

export function PendingOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const removeOrdersToCancel = useSetAtom(removeOrdersToCancelAtom)

  const pending = useCombinedPendingOrders({ chainId })
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const _fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const presignOrders = usePresignOrders()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const triggerTotalSurplusUpdate = useTriggerTotalSurplusUpdateCallback()
  const updatePresignGnosisSafeTx = useUpdatePresignGnosisSafeTx()
  const getSafeInfo = useGetSafeInfo()

  const fulfillOrdersBatch = useCallback(
    (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => {
      _fulfillOrdersBatch(fulfillOrdersBatchParams)
      // Remove orders from the cancelling queue (marked by checkbox in the orders table)
      removeOrdersToCancel(fulfillOrdersBatchParams.ordersData.map((item) => item.id))
    },
    [_fulfillOrdersBatch, removeOrdersToCancel]
  )

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string, orderClass: OrderClass) => {
      if (!account) {
        return []
      }

      if (!isUpdating.current) {
        isUpdating.current = true
        // const startTime = Date.now()
        // console.debug('[PendingOrdersUpdater] Updating orders....')
        return _updateOrders({
          account,
          chainId,
          orders: pendingRef.current.filter((order) => order.class === orderClass),
          addOrUpdateOrders,
          fulfillOrdersBatch,
          expireOrdersBatch,
          cancelOrdersBatch,
          presignOrders,
          addOrderToSurplusQueue,
          triggerTotalSurplusUpdate,
          updatePresignGnosisSafeTx,
          getSafeInfo,
        }).finally(() => {
          isUpdating.current = false
          // console.debug(`[PendingOrdersUpdater] Updated orders in ${Date.now() - startTime}ms`)
        })
      }
    },
    [
      addOrUpdateOrders,
      fulfillOrdersBatch,
      expireOrdersBatch,
      cancelOrdersBatch,
      presignOrders,
      addOrderToSurplusQueue,
      triggerTotalSurplusUpdate,
      updatePresignGnosisSafeTx,
      getSafeInfo,
    ]
  )

  useEffect(() => {
    if (!chainId || !account) {
      return
    }

    const marketInterval = setInterval(
      () => updateOrders(chainId, account, OrderClass.MARKET),
      MARKET_OPERATOR_API_POLL_INTERVAL
    )
    const limitInterval = setInterval(
      () => updateOrders(chainId, account, OrderClass.LIMIT),
      LIMIT_OPERATOR_API_POLL_INTERVAL
    )

    return () => {
      clearInterval(marketInterval)
      clearInterval(limitInterval)
    }
  }, [account, chainId, updateOrders])

  return null
}
