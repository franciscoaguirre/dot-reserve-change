import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from "@polkadot-labs/hdkd-helpers";
import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import { getPolkadotSigner } from "polkadot-api/signer";

const entropy = mnemonicToEntropy(DEV_PHRASE);
const miniSecret = entropyToMiniSecret(entropy);
const derive = sr25519CreateDerive(miniSecret);
const hdkdKeyPair = derive("//Alice");
 
export const alice = getPolkadotSigner(
  hdkdKeyPair.publicKey,
  "Sr25519",
  hdkdKeyPair.sign,
);
export const aliceAddress = ss58Address(alice.publicKey, 42);
