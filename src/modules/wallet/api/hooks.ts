import { useAtomValue } from 'jotai'

import { GnosisSafeInfo, useIsSafeApp, WalletDetails, WalletInfo } from 'modules/wallet'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletDisplayedAddress, walletInfoAtom } from './state'

export function useWalletInfo(): WalletInfo {
  return useAtomValue(walletInfoAtom)
}

export function useWalletDetails(): WalletDetails {
  return useAtomValue(walletDetailsAtom)
}

export function useWalletDisplayedAddress(): string {
  return useAtomValue(walletDisplayedAddress)
}

export function useGnosisSafeInfo(): GnosisSafeInfo | undefined {
  return useAtomValue(gnosisSafeInfoAtom)
}

export function useIsBundlingSupported(): boolean {
  // For now, bundling can only be performed while the App is loaded as a Safe App
  // Pending a custom RPC endpoint implementation on Safe side to allow
  // tx bundling via WalletConnect
  return useIsSafeApp()
}
