import { Erc20, GPv2Settlement } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'

import { AppDispatch } from 'legacy/state'
import { PostOrderParams } from 'legacy/utils/trade'

import { AppDataInfo } from 'modules/appData'

export interface TradeFlowContext {
  // signer changes creates redundant re-renders
  // validTo must be calculated just before signing of an order
  postOrderParams: Omit<PostOrderParams, 'validTo' | 'signer'>
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  rateImpact: number
  appData: AppDataInfo
  provider: Web3Provider
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
}

export interface SafeBundleFlowContext extends TradeFlowContext {
  erc20Contract: Erc20
  spender: string
  safeAppsSdk: SafeAppsSDK
}

export class PriceImpactDeclineError extends Error {}
