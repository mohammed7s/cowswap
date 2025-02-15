import { CurrencyAmount } from '@uniswap/sdk-core'

import { useSelect } from 'react-cosmos/fixture'

import { Field } from 'legacy/state/swap/actions'
import { WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'

import { SwapButtons, SwapButtonsContext } from './index'

const currency = WETH_GOERLI
const amount = 200000000

const swapButtonsContext: SwapButtonsContext = {
  onCurrencySelection(field: Field, currency): void {
    console.log('Currency selected', field, currency)
  },
  swapButtonState: SwapButtonState.RegularSwap,
  chainId: 1,
  wrappedToken: WETH_GOERLI,
  handleSwap: () => void 0,
  inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  onWrapOrUnwrap: null,
  onEthFlow: () => void 0,
  openSwapConfirm: () => void 0,
  toggleWalletModal: () => void 0,
  hasEnoughWrappedBalanceForSwap: true,
}

function useCustomProps(): SwapButtonsContext {
  const [swapButtonState] = useSelect('swapButtonState', {
    options: Object.values(SwapButtonState),
    defaultValue: SwapButtonState.NeedApprove,
  })

  return {
    ...swapButtonsContext,
    swapButtonState,
  }
}

const Default = () => {
  return <SwapButtons {...useCustomProps()} />
}

const Fixtures = {
  Default: <Default />,
}

export default Fixtures
