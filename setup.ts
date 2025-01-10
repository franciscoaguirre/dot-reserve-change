import { setupNetworks, type NetworkContext } from "@acala-network/chopsticks-testing"
import { pen, wnd, wndAh, XcmV3Junction, XcmV3Junctions, XcmVersionedLocation } from "@polkadot-api/descriptors"
import { createClient, type ChainDefinition, type SS58String, type TypedApi } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/web"

import 'dotenv/config';

export interface MockNetwork {
  parachain: MockChain<typeof pen>,
  relay: MockChain<typeof wnd>,
  assetHub: MockChain<typeof wndAh>,
  paraSovAccOnRelay: SS58String,
  paraSovAccOnAssetHub: SS58String,
}

type Token = 'Para' | 'Relay';

export interface MockChain<T extends ChainDefinition> {
  context: NetworkContext,
  api: TypedApi<T>
  // who, what, amount.
  setTokens: (tokens: [SS58String, Token, bigint][]) => Promise<void>,
  // who, what.
  getTokens: (tokens: [SS58String, Token][]) => Promise<bigint[]>,
}

export const setup = async (isAfter: boolean): Promise<MockNetwork> => {
  const wasmOverride = isAfter ? process.env.RUNTIME_AFTER : process.env.RUNTIME_BEFORE;
  const relayEndpoint = getRelayEndpoint();
  const assetHubEndpoint = getAssetHubEndpoint();
  const { parachain, polkadot, assetHub } = await setupNetworks({
    parachain: {
      endpoint: process.env.PARACHAIN_WS,
      'wasm-override': wasmOverride,
      // 'runtime-log-level': 5,
      db: './db.sqlite',
      port: 8006,
    },
    // Have to call it "polkadot" else it won't be recognized as a relay chain.
    polkadot: {
      endpoint: relayEndpoint,
      db: './db.sqlite',
      port: 8007,
    },
    assetHub: {
      endpoint: assetHubEndpoint,
      db: './db.sqlite',
      port: 8008,
    },
  });

  const parachainClient = createClient(getWsProvider(parachain.ws.endpoint));
  const parachainApi = parachainClient.getTypedApi(pen);
  const relayClient = createClient(getWsProvider(polkadot.ws.endpoint));
  const relayApi = relayClient.getTypedApi(wnd);
  const assetHubClient = createClient(getWsProvider(assetHub.ws.endpoint));
  const assetHubApi = assetHubClient.getTypedApi(wndAh);

  const paraSovAccOnRelay = (await relayApi
    .apis
    .LocationToAccountApi
    .convert_location(XcmVersionedLocation.V4({
      parents: 0,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(2042))
    }))).value as SS58String;
  const paraSovAccOnAssetHub = (await assetHubApi
    .apis
    .LocationToAccountApi
    .convert_location(XcmVersionedLocation.V4({
      parents: 1,
      interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(2042))
    }))).value as SS58String;

  return {
    parachain: {
      context: parachain,
      api: parachainApi,
      setTokens: async (tokens) => {
        const changes: any = {};
        for (const [who, what, amount] of tokens) {
          if (what === 'Para') {
            changes.System = {
              Account: [
                [[who], { providers: 1, data: { free: amount } }],
              ],
            };
          } else if (what === 'Relay') {
            changes.ForeignAssets = {
              Asset: [
                [[{ parents: 1, interior: 'Here' }], { supply: amount }],
              ],
              Account: [
                [[{ parents: 1, interior: 'Here' }, who], { balance: amount }],
              ],
            };
          }
        }
        await parachain.dev.setStorage(changes);
      },
      getTokens: async (tokens) => {
        const results = [];
        for (const [who, what] of tokens) {
          if (what === 'Para') {
            results.push((await parachainApi.query.System.Account.getValue(who)).data.free);
          } else if (what === 'Relay') {
            results.push((await parachainApi
              .query
              .ForeignAssets
              .Account
              .getValue({
                parents: 1, interior: XcmV3Junctions.Here()
              }, who))?.balance ?? 0n
            );
          }
        }
        return results;
      },
    },
    relay: {
      context: polkadot,
      api: relayApi,
      setTokens: async (tokens) => {
        const changes: any = {};
        for (const [who, what, amount] of tokens) {
          if (what === 'Relay') {
            changes.System = changes.System ?? {};
            changes.System.Account = changes.System.Account ?? [];
            changes.System.Account.push(
              [[who], { providers: 1, data: { free: amount } }],
            );
          }
        }
        await polkadot.dev.setStorage(changes);
      },
      getTokens: async (tokens) => {
        const results = [];
        for (const [who, what] of tokens) {
          if (what === 'Relay') {
            results.push((await relayApi
              .query
              .System
              .Account
              .getValue(who)).data.free
            );
          }
        }
        return results;
      },
    },
    assetHub: {
      context: assetHub,
      api: assetHubApi,
      setTokens: async (tokens) => {
        const changes: any = {};
        for (const [who, what, amount] of tokens) {
          if (what === 'Relay') {
            changes.System = changes.System ?? {};
            changes.System.Account = changes.System.Account ?? [];
            changes.System.Account.push(
              [[who], { providers: 1, data: { free: amount } }],
            );
          }
        }
        await assetHub.dev.setStorage(changes);
      },
      getTokens: async (tokens) => {
        const results = [];
        for (const [who, what] of tokens) {
          if (what === 'Relay') {
            results.push((await assetHubApi
              .query
              .System
              .Account
              .getValue(who)).data.free
            );
          }
        }
        return results;
      },
    },
    paraSovAccOnAssetHub,
    paraSovAccOnRelay,
  };
}

type WebSocketEndpoint = `wss://${string}`;

const getRelayEndpoint = (): WebSocketEndpoint => {
  switch (process.env.NETWORK) {
    case 'westend':
      return 'wss://westend-rpc.polkadot.io';
    case 'kusama':
      return 'wss://rpc-kusama.luckyfriday.io';
    case 'polkadot':
      return 'wss://rpc-polkadot.luckyfriday.io';
    default:
      throw 'Set one of the available networks: westend kusama polkadot';
  }
}

const getAssetHubEndpoint = (): WebSocketEndpoint => {
  switch (process.env.NETWORK) {
    case 'westend':
      return 'wss://westend-asset-hub-rpc.polkadot.io';
    case 'kusama':
      return 'wss://kusama-asset-hub-rpc.polkadot.io';
    case 'polkadot':
      return 'wss://polkadot-asset-hub-rpc.polkadot.io';
    default:
      throw 'Set one of the available networks: westend kusama polkadot';
  }
}

export const getRelayTokenDecimals = (): bigint => {
  switch (process.env.NETWORK) {
    case 'westend':
      return 12n;
    case 'kusama':
      return 12n;
    case 'polkadot':
      return 10n;
    default:
      throw 'Set one of the available networks: westend kusama polkadot';
  }
}
