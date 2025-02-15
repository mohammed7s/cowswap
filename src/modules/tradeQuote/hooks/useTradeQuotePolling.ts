import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import { useIsUnsupportedTokens } from 'legacy/state/lists/hooks'
import { onlyResolvesLast } from 'legacy/utils/async'

import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { updateTradeQuoteAtom } from 'modules/tradeQuote/state/tradeQuoteAtom'

import { getQuote } from 'api/gnosisProtocol/api'
import GpQuoteError, { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'

// Every 10s
const PRICE_UPDATE_INTERVAL = 10_000

// Solves the problem of multiple requests
const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useTradeQuotePolling() {
  // TODO: add throttling
  const quoteParams = useQuoteParams()

  const updateQuoteState = useSetAtom(updateTradeQuoteAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const getIsUnsupportedTokens = useIsUnsupportedTokens()
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  useLayoutEffect(() => {
    if (!quoteParams) {
      updateQuoteState({ response: null, isLoading: false })
      return
    }

    const isUnsupportedTokens = getIsUnsupportedTokens(quoteParams)

    // Don't fetch quote if token is not supported
    if (isUnsupportedTokens) {
      return
    }

    const fetchQuote = () => {
      updateQuoteState({ isLoading: true, error: null })

      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled) {
            return
          }

          updateQuoteState({ response: data, isLoading: false, error: null })
        })
        .catch((error: GpQuoteError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
          updateQuoteState({ isLoading: false, error })

          if (error.type === GpQuoteErrorCodes.UnsupportedToken) {
            processUnsupportedTokenError(error, quoteParams)
          }
        })
    }

    fetchQuote()

    const intervalId = setInterval(fetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, updateQuoteState, updateCurrencyAmount, processUnsupportedTokenError, getIsUnsupportedTokens])

  return null
}
