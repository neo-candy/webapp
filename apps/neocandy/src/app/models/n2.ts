export interface NeoPublicKeyData {
  address: string;
  publicKey: string;
}

export interface NeoAccount {
  address: string;
  label: string;
}

export const N2MainNet = 1;
export const N2TestNet = 2;
export const N3MainNet = 3;
export const N3TestNet = 4;
export type NeoChain =
  | typeof N2MainNet
  | typeof N2TestNet
  | typeof N3MainNet
  | typeof N3TestNet;

export interface NeoNetwork {
  networks?: string[];
  chainId?: NeoChain;
  defaultNetwork?: string;
}

export interface NeoBlockheightChangedEventResponse {
  chainId: NeoChain;
  blockHeight: number;
  blockTime: number;
  blockHash: string;
  tx: string[];
}

export interface NeoTransactionConfirmedEventResponse {
  chainId: number;
  txid: string;
  blockHeight: number;
  blockTime: number;
}
export interface NeoAccountChangedEventResponse {
  address: string;
  label: string;
}

export interface NeoConnectedEventResponse {
  address: string;
  label: string;
}

export interface NeoNetworkChangedEventResponse {
  networks?: string[];
  chainId?: NeoChain;
  defaultNetwork?: string;
}

export const READY = 'NEOLine.NEO.EVENT.READY';
export const ACCOUNT_CHANGED = 'NEOLine.NEO.EVENT.ACCOUNT_CHANGED';
export const CONNECTED = 'NEOLine.NEO.EVENT.READY';
export const DISCONNECTED = 'NEOLine.NEO.EVENT.ACCOUNT_CHANGED';
export const NETWORK_CHANGED = 'NEOLine.NEO.EVENT.NETWORK_CHANGED';
export const BLOCK_HEIGHT_CHANGED = 'NEOLine.NEO.EVENT.ACCOUNT_CHANGED';
export const TRANSACTION_CONFIRMED = 'NEOLine.NEO.EVENT.ACCOUNT_CHANGED';

export interface N2 {
  getNetworks(): Promise<NeoNetwork>;
  getAccount(): Promise<NeoAccount>;
  getPublicKey(): Promise<NeoPublicKeyData>;
}
