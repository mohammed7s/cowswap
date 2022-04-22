/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface VCowInterface extends ethers.utils.Interface {
  functions: {
    "claim(uint256,uint8,address,uint256,uint256,bytes32[])": FunctionFragment;
    "claimMany(uint256[],uint8[],address[],uint256[],uint256[],bytes32[][],uint256[])": FunctionFragment;
    "isClaimed(uint256)": FunctionFragment;
    "merkleRoot()": FunctionFragment;
    "deploymentTimestamp()": FunctionFragment;
    "gnoPrice()": FunctionFragment;
    "usdcPrice()": FunctionFragment;
    "nativeTokenPrice()": FunctionFragment;
    "swappableBalanceOf(address)": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "swapAll()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "claim",
    values: [
      BigNumberish,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BytesLike[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "claimMany",
    values: [
      BigNumberish[],
      BigNumberish[],
      string[],
      BigNumberish[],
      BigNumberish[],
      BytesLike[][],
      BigNumberish[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "isClaimed",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "merkleRoot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "deploymentTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "gnoPrice", values?: undefined): string;
  encodeFunctionData(functionFragment: "usdcPrice", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nativeTokenPrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "swappableBalanceOf",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(functionFragment: "swapAll", values?: undefined): string;

  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claimMany", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "isClaimed", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "merkleRoot", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "deploymentTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "gnoPrice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "usdcPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "nativeTokenPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "swappableBalanceOf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swapAll", data: BytesLike): Result;

  events: {
    "Claimed(uint256,uint8,address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Claimed"): EventFragment;
}

export class VCow extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: VCowInterface;

  functions: {
    claim(
      index: BigNumberish,
      claimType: BigNumberish,
      claimant: string,
      claimableAmount: BigNumberish,
      claimedAmount: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    claimMany(
      indices: BigNumberish[],
      claimTypes: BigNumberish[],
      claimants: string[],
      claimableAmounts: BigNumberish[],
      claimedAmounts: BigNumberish[],
      merkleProofs: BytesLike[][],
      sentEth: BigNumberish[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    isClaimed(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    merkleRoot(overrides?: CallOverrides): Promise<[string]>;

    deploymentTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;

    gnoPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    usdcPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    nativeTokenPrice(overrides?: CallOverrides): Promise<[BigNumber]>;

    swappableBalanceOf(
      user: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    swapAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  claim(
    index: BigNumberish,
    claimType: BigNumberish,
    claimant: string,
    claimableAmount: BigNumberish,
    claimedAmount: BigNumberish,
    merkleProof: BytesLike[],
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  claimMany(
    indices: BigNumberish[],
    claimTypes: BigNumberish[],
    claimants: string[],
    claimableAmounts: BigNumberish[],
    claimedAmounts: BigNumberish[],
    merkleProofs: BytesLike[][],
    sentEth: BigNumberish[],
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  isClaimed(index: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

  merkleRoot(overrides?: CallOverrides): Promise<string>;

  deploymentTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  gnoPrice(overrides?: CallOverrides): Promise<BigNumber>;

  usdcPrice(overrides?: CallOverrides): Promise<BigNumber>;

  nativeTokenPrice(overrides?: CallOverrides): Promise<BigNumber>;

  swappableBalanceOf(
    user: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  balanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

  swapAll(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    claim(
      index: BigNumberish,
      claimType: BigNumberish,
      claimant: string,
      claimableAmount: BigNumberish,
      claimedAmount: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: CallOverrides
    ): Promise<void>;

    claimMany(
      indices: BigNumberish[],
      claimTypes: BigNumberish[],
      claimants: string[],
      claimableAmounts: BigNumberish[],
      claimedAmounts: BigNumberish[],
      merkleProofs: BytesLike[][],
      sentEth: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    isClaimed(index: BigNumberish, overrides?: CallOverrides): Promise<boolean>;

    merkleRoot(overrides?: CallOverrides): Promise<string>;

    deploymentTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    gnoPrice(overrides?: CallOverrides): Promise<BigNumber>;

    usdcPrice(overrides?: CallOverrides): Promise<BigNumber>;

    nativeTokenPrice(overrides?: CallOverrides): Promise<BigNumber>;

    swappableBalanceOf(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    swapAll(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    Claimed(
      index?: null,
      claimType?: null,
      claimant?: null,
      claimableAmount?: null,
      claimedAmount?: null
    ): TypedEventFilter<
      [BigNumber, number, string, BigNumber, BigNumber],
      {
        index: BigNumber;
        claimType: number;
        claimant: string;
        claimableAmount: BigNumber;
        claimedAmount: BigNumber;
      }
    >;
  };

  estimateGas: {
    claim(
      index: BigNumberish,
      claimType: BigNumberish,
      claimant: string,
      claimableAmount: BigNumberish,
      claimedAmount: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    claimMany(
      indices: BigNumberish[],
      claimTypes: BigNumberish[],
      claimants: string[],
      claimableAmounts: BigNumberish[],
      claimedAmounts: BigNumberish[],
      merkleProofs: BytesLike[][],
      sentEth: BigNumberish[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    isClaimed(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    merkleRoot(overrides?: CallOverrides): Promise<BigNumber>;

    deploymentTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    gnoPrice(overrides?: CallOverrides): Promise<BigNumber>;

    usdcPrice(overrides?: CallOverrides): Promise<BigNumber>;

    nativeTokenPrice(overrides?: CallOverrides): Promise<BigNumber>;

    swappableBalanceOf(
      user: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    balanceOf(user: string, overrides?: CallOverrides): Promise<BigNumber>;

    swapAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    claim(
      index: BigNumberish,
      claimType: BigNumberish,
      claimant: string,
      claimableAmount: BigNumberish,
      claimedAmount: BigNumberish,
      merkleProof: BytesLike[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    claimMany(
      indices: BigNumberish[],
      claimTypes: BigNumberish[],
      claimants: string[],
      claimableAmounts: BigNumberish[],
      claimedAmounts: BigNumberish[],
      merkleProofs: BytesLike[][],
      sentEth: BigNumberish[],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    isClaimed(
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    merkleRoot(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    deploymentTimestamp(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    gnoPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    usdcPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nativeTokenPrice(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    swappableBalanceOf(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    balanceOf(
      user: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    swapAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
