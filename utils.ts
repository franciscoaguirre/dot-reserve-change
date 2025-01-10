import { getRelayTokenDecimals } from "./setup";

// Helper function to print complex values.
export const stringify = (obj: any) => JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);

export const tokens = (what: 'Para' | 'Relay', amount: number): bigint => {
  if (what === 'Para') {
    return BigInt(amount) * 10n ** (BigInt(process.env.DECIMALS ?? '10'));
  } else {
    return BigInt(amount) * 10n ** getRelayTokenDecimals();
  }
};
