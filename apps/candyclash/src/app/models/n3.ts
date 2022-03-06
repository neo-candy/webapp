type NeoType =
  | 'Boolean'
  | 'Integer'
  | 'Array'
  | 'ByteArray'
  | 'String'
  | 'Address'
  | 'Hash160'
  | 'Hash256'
  | 'Any';

export type NONE = 0;
export type CALLED_BY_ENTRY = 1;
export type CONTRACT = 16;
export type CONTRACTS_GROUP = 32;
export type GLOBAL = 128;

export type NeoScope =
  | NONE
  | CALLED_BY_ENTRY
  | CONTRACT
  | CONTRACTS_GROUP
  | GLOBAL;

export interface NeoTypedValue {
  type: NeoType;
  value: string | boolean | any[];
}

export interface NeoTxConfirmation {
  txId: string;
  blockHeight: number;
  blockTime: number;
}

export interface NeoSigner {
  account: string;
  scopes: NeoScope;
}

export interface NeoProvider {
  name: string;
  website: string;
  version: string;
  compatibility: string[];
  extra: any;
}

export interface NeoBalance {
  symbol: string;
  amount: string;
  contract: string;
}

export interface NeoGetBalanceResponse {
  [address: string]: NeoBalance[];
}

export interface NeoInvokeReadResponse {
  script: string;
  state: string;
  gas_consumed: string;
  stack: NeoTypedValue[];
  exception?: string;
}

export interface NeoPickAddressResponse {
  label: string;
  address: string;
}

export interface NeoSendResponse {
  txid: string;
  nodeURL: string;
}

export interface NeoInvokeWriteResponse {
  txid: string;
  nodeURL: string;
  signedTx?: string;
  exception?: string;
}

export interface NeoInvokeArgument {
  scriptHash: string;
  operation: string;
  args: NeoTypedValue[];
}

export interface NeoSignMessageResponse {
  publicKey: string;
  data: string;
  salt: string;
  message: string;
}

export interface NeoInvokeReadArgs {
  scriptHash: string;
  operation: string;
  args: NeoTypedValue[];
  signers: NeoSigner[];
}

export interface NeoInvokeReadMultiArgs {
  invokeReadArgs: {
    scriptHash: string;
    operation: string;
    args: NeoTypedValue[];
  }[];
  signers: NeoSigner[];
}

export interface NeoGetStorageArgs {
  scriptHash: string;
  key: string;
}

export interface NeoVerifyMessageArgs {
  message: string;
  data: string;
  publicKey: string;
}

export interface NeoGetBlockArgs {
  blockHeight: number;
}

export interface NeoGetTransactionArgs {
  txid: string;
}

export interface NeoGetApplicationLogArgs {
  txid: string;
}

export interface NeoAddressToScriptHashArgs {
  address: string;
}

export interface NeoScriptHashToAddressArgs {
  address: string;
}

export interface NeoSendArgs {
  fromAddress: string;
  toAddress: string;
  asset: string;
  amount: string;
  fee?: string;
  broadcastOverride?: boolean;
}

export interface NeoInvokeArgs {
  scriptHash: string;
  operation: string;
  args: NeoTypedValue[];
  signers: NeoSigner[];
  fee?: string;
  extraSystemFee?: string;
  broadcastOverride?: boolean;
}

export interface NeoInvokeMultipleArgs {
  fee?: string;
  extraSystemFee?: string;
  signers: NeoSigner[];
  invokeArgs?: NeoInvokeArgument[];
  broadcastOverride?: boolean;
}

export interface NeoSignMessageArgs {
  message: string;
}

export interface NeoAddressToScriptHashResponse {
  scriptHash: string;
}

export interface NeoScriptHashToAddressResponse {
  address: string;
}

export interface N3 {
  getProvider(): Promise<NeoProvider>;
  getBalance(): Promise<NeoGetBalanceResponse>;
  getStorage(args: NeoGetStorageArgs): Promise<string>;
  invokeRead(args: NeoInvokeReadArgs): Promise<NeoInvokeReadResponse>;
  invokeReadMulti(
    args: NeoInvokeReadMultiArgs
  ): Promise<NeoInvokeReadResponse[]>;
  verifyMessage(args: NeoVerifyMessageArgs): Promise<boolean>;
  getBlock(args: NeoGetBlockArgs): Promise<any>;
  getTransaction(args: NeoGetTransactionArgs): Promise<any>;
  getApplicationLog(args: NeoGetApplicationLogArgs): Promise<any>;
  pickAddress(): Promise<NeoPickAddressResponse>;
  AddressToScriptHash(
    args: NeoAddressToScriptHashArgs
  ): Promise<NeoAddressToScriptHashResponse>;
  ScriptHashToAddress(
    args: NeoScriptHashToAddressArgs
  ): Promise<NeoScriptHashToAddressResponse>;
  // write
  send(args: NeoSendArgs): Promise<NeoSendResponse>;
  invoke(args: NeoInvokeArgs): Promise<NeoInvokeWriteResponse>;
  invokeMultiple(args: NeoInvokeMultipleArgs): Promise<NeoInvokeWriteResponse>;
  signMessage(args: NeoSignMessageArgs): Promise<NeoSignMessageResponse>;
}

export const N3READY = 'NEOLine.N3.EVENT.READY';
