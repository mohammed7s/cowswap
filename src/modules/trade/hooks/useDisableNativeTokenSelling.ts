import { useEffect } from 'react'

import { NATIVE_CURRENCY_BUY_TOKEN } from 'legacy/constants'
import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'

import { useWalletInfo } from 'modules/wallet'

import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { getDefaultTradeRawState } from '../types/TradeRawState'

/**
 * Since the selling of ETH is not supported in limit and advanced orders
 * We automatically replace it by WETH
 */
export function useDisableNativeTokenSelling() {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId, outputCurrencyId } = state || {}
  const navigate = useTradeNavigate()

  useEffect(() => {
    const nativeToken = chainId ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : null
    const wrappedToken = chainId ? WRAPPED_NATIVE_CURRENCY[chainId] : null

    if (!chainId || !nativeToken || !wrappedToken) return

    const nativeIds = [nativeToken.address, nativeToken.symbol].map((value) => value?.toLowerCase())
    const wrappedIds = [wrappedToken.address, wrappedToken.symbol].map((value) => value?.toLowerCase())

    const isInputNative = !!inputCurrencyId && nativeIds.includes(inputCurrencyId?.toLowerCase())
    const isOutputWrappedNative = !!outputCurrencyId && wrappedIds.includes(outputCurrencyId?.toLowerCase())

    const defaultInputCurrencyId = getDefaultTradeRawState(chainId).inputCurrencyId

    if (isInputNative && outputCurrencyId && !isOutputWrappedNative) {
      navigate(chainId, {
        inputCurrencyId: isInputNative ? defaultInputCurrencyId : inputCurrencyId,
        outputCurrencyId,
      })
    }
  }, [chainId, inputCurrencyId, outputCurrencyId, navigate])
}
