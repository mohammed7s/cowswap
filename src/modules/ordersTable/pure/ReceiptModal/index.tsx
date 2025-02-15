import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Fraction, Token } from '@uniswap/sdk-core'

import { OrderStatus } from 'legacy/state/orders/actions'
import { CloseIcon } from 'legacy/theme'

import { TwapOrderItem } from 'modules/twap/types'

import { InlineBanner } from 'common/pure/InlineBanner'
import { CowModal } from 'common/pure/Modal'
import { getSellAmountWithFee } from 'utils/orderUtils/getSellAmountWithFee'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { CurrencyField } from './CurrencyField'
import { DateField } from './DateField'
import { FeeField } from './FeeField'
import { FieldLabel } from './FieldLabel'
import { SafeTxFields } from './fields/SafeTxFields'
import { FilledField } from './FilledField'
import { IdField } from './IdField'
import { OrderTypeField } from './OrderTypeField'
import { PriceField } from './PriceField'
import { StatusField } from './StatusField'
import * as styledEl from './styled'
import { SurplusField } from './SurplusField'

interface ReceiptProps {
  isOpen: boolean
  order: ParsedOrder
  twapOrder: TwapOrderItem | null
  isTwapPartOrder: boolean
  chainId: SupportedChainId
  onDismiss: () => void
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
  limitPrice: Fraction | null
  executionPrice: Fraction | null
  estimatedExecutionPrice: Fraction | null
}

const tooltips: { [key: string]: string | JSX.Element } = {
  LIMIT_PRICE: 'You will receive this price or better for your tokens.',
  EXECUTION_PRICE: 'An order’s actual execution price will vary based on the market price and network fees.',
  EXECUTES_AT:
    'Fees (incl. gas) are covered by filling your order when the market price is better than your limit price.',
  FILLED: (
    <span>
      How much of the order has been filled.
      <br />
      Market orders are always <i>Fill or kill</i>, while limit orders are by default <i>Partially fillable</i>, but can
      also be changed to <i>Fill or kill</i> through your order settings.
    </span>
  ),
  SURPLUS: 'The amount of extra tokens you get on top of your limit price.',
  FEE: 'CoW Protocol covers the fees by executing your order at a slightly better price than your limit price.',
  CREATED: 'Your order was created on this date & time. It will remain open until it expires or is filled.',
  EXPIRY:
    "If your order has not been filled by this date & time, it will expire. Don't worry - expirations and order placement are free on CoW Swap!",
  ORDER_TYPE: (
    <span>
      Orders on CoW Swap can either be market orders (which fill at the market price within the slippage tolerance you
      set) or limit orders (which fill at a price you specify).
      <br />
      <br />
      Market orders are always <i>Fill or kill</i>, while limit orders are by default <i>Partially fillable</i>, but can
      also be changed to <i>Fill or kill</i> through your order settings.
    </span>
  ),
}

const TWAP_PART_ORDER_EXISTS_STATES = new Set([OrderStatus.PENDING, OrderStatus.FULFILLED, OrderStatus.EXPIRED])

// TODO: add cosmos fixture for this component
export function ReceiptModal({
  isOpen,
  onDismiss,
  order,
  twapOrder,
  isTwapPartOrder,
  chainId,
  buyAmount,
  limitPrice,
  executionPrice,
  estimatedExecutionPrice,
}: ReceiptProps) {
  if (!order || !chainId) {
    return null
  }

  const twapPartOrderExists = isTwapPartOrder && TWAP_PART_ORDER_EXISTS_STATES.has(order.status)

  const inputLabel = order.kind === OrderKind.SELL ? 'You sell' : 'You sell at most'
  const outputLabel = order.kind === OrderKind.SELL ? 'You receive at least' : 'You receive exactly'
  const safeTxParams = twapOrder?.safeTxParams

  return (
    <CowModal onDismiss={onDismiss} isOpen={isOpen}>
      <styledEl.Wrapper>
        <styledEl.Header>
          <styledEl.Title>Order Receipt</styledEl.Title>
          <CloseIcon onClick={() => onDismiss()} />
        </styledEl.Header>

        {twapOrder && (
          <styledEl.InfoBannerWrapper>
            <InlineBanner type="information">
              <p>
                {isTwapPartOrder
                  ? `Part of a ${twapOrder.order.n}-part TWAP order split`
                  : `TWAP order split into ${twapOrder.order.n} parts`}
              </p>
            </InlineBanner>
          </styledEl.InfoBannerWrapper>
        )}

        <styledEl.Body>
          <CurrencyField amount={getSellAmountWithFee(order)} token={order.inputToken} label={inputLabel} />
          <CurrencyField amount={buyAmount} token={order.outputToken} label={outputLabel} />

          <styledEl.FieldsWrapper>
            <styledEl.Field>
              <FieldLabel label="Status" />
              <StatusField order={order} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Limit price" tooltip={tooltips.LIMIT_PRICE} />
              <PriceField order={order} price={limitPrice} />
            </styledEl.Field>

            {(!twapOrder || isTwapPartOrder) && (
              <styledEl.Field>
                {estimatedExecutionPrice && order.status === OrderStatus.PENDING ? (
                  <>
                    <FieldLabel label="Executes at" tooltip={tooltips.EXECUTES_AT} />
                    <PriceField order={order} price={estimatedExecutionPrice} />
                  </>
                ) : (
                  <>
                    <FieldLabel
                      label={order.partiallyFillable ? 'Avg. execution price' : 'Execution price'}
                      tooltip={tooltips.EXECUTION_PRICE}
                    />{' '}
                    <PriceField order={order} price={executionPrice} />
                  </>
                )}
              </styledEl.Field>
            )}

            {/*TODO: Currently, we don't have this information for parent TWAP orders*/}
            {/*The condition should be removed once we have the data*/}
            {(!twapOrder || isTwapPartOrder) && (
              <>
                <styledEl.Field>
                  <FieldLabel label="Filled" tooltip={tooltips.FILLED} />
                  <FilledField order={order} />
                </styledEl.Field>

                <styledEl.Field>
                  <FieldLabel label="Order surplus" tooltip={tooltips.SURPLUS} />
                  <SurplusField order={order} />
                </styledEl.Field>

                <styledEl.Field>
                  <FieldLabel label="Fee" tooltip={tooltips.FEE} />
                  <FeeField order={order} />
                </styledEl.Field>
              </>
            )}

            <styledEl.Field>
              <FieldLabel label="Created" tooltip={tooltips.CREATED} />
              <DateField date={order.creationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Expiry" tooltip={tooltips.EXPIRY} />
              <DateField date={order.expirationTime} />
            </styledEl.Field>

            <styledEl.Field>
              <FieldLabel label="Order type" tooltip={tooltips.ORDER_TYPE} />
              <OrderTypeField order={order} />
            </styledEl.Field>

            {/*TODO: add a link to explorer when it will support TWAP orders*/}
            {(!twapOrder || twapPartOrderExists) && (
              <styledEl.Field>
                {order.executionData.activityId && (
                  <>
                    <FieldLabel label={order.executionData.activityTitle} />
                    <IdField id={order.executionData.activityId} chainId={chainId} />
                  </>
                )}
              </styledEl.Field>
            )}
            {/*TODO: make it more generic. The ReceiptModal should know about TWAP and should display Safe info for any ComposableCow order*/}
            {twapOrder && safeTxParams && (
              <SafeTxFields
                chainId={chainId}
                safeAddress={twapOrder.safeAddress}
                safeTxHash={safeTxParams.safeTxHash}
                nonce={safeTxParams.nonce}
                confirmations={safeTxParams.confirmations}
                confirmationsRequired={safeTxParams.confirmationsRequired}
              />
            )}
          </styledEl.FieldsWrapper>
        </styledEl.Body>
      </styledEl.Wrapper>
    </CowModal>
  )
}
