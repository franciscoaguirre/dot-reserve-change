import { describe, expect, test, beforeEach } from 'bun:test';
import { fromAssetHubToParachain, fromParachainToAssetHub, fromParachainToRelay, fromRelayToParachain } from './transfers';
import { alice, aliceAddress } from './signer';
import { setup, type MockNetwork } from './setup';

describe('before the change', () => {
  let network: MockNetwork;

  beforeEach(async () => {
    network = await setup(false);
  });

  test('from para to relay', async () => {
    // Setup.
    await network.parachain.setTokens([
      [aliceAddress, 'Para', '1000000000000000'], // 1000 PEN.
      [aliceAddress, 'Relay', '10000000000000'] // 10 WND.
    ]);
    await network.relay.setTokens([
      [aliceAddress, 'Relay', '0'], // 0 WND.
      [network.paraSovAccOnRelay, 'Relay', '10000000000000'] // 10 WND.
    ]);
    const [senderBalanceBefore] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);
    const [receiverBalanceBefore, paraSovAccBalanceBefore] = await network.relay.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnRelay, 'Relay']]);

    // Transfer 1 WND from Penpal to Relay.
    const transferAmount = 1_000_000_000_000n;
    const tx = fromParachainToRelay(network.parachain.api, transferAmount, alice.publicKey);
    const result = await tx.signAndSubmit(alice);

    // Assertions.
    expect(result.ok).toBe(true);
    await network.relay.context.dev.newBlock();
    const [senderBalanceAfter] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);
    const [receiverBalanceAfter, paraSovAccBalanceAfter] = await network.relay.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnRelay, 'Relay']]);
    expect(senderBalanceAfter).toBeLessThan(senderBalanceBefore!);
    expect(receiverBalanceAfter).toBeGreaterThan(receiverBalanceBefore);
    expect(paraSovAccBalanceAfter).toBeLessThan(paraSovAccBalanceBefore);
  }, 100_000);

  test('from relay to para', async () => {
    // Setup.
    await network.relay.setTokens([[aliceAddress, 'Relay', '10000000000000'], [network.paraSovAccOnRelay, 'Relay', '0']]);
    await network.parachain.setTokens([[aliceAddress, 'Para', '10000000000000'], [aliceAddress, 'Relay', '0']]);
    const [senderBalanceBefore, paraSovAccBalanceBefore] = await network.relay.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnRelay, 'Relay']]);
    const [receiverBalanceBefore] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);

    // Transfer 1 WND from Relay to Penpal.
    const transferAmount = 1_000_000_000_000n;
    const tx = fromRelayToParachain(network.relay.api, transferAmount, alice.publicKey);
    const result = await tx.signAndSubmit(alice);

    // Assertions.
    expect(result.ok).toBe(true);
    await network.parachain.context.dev.newBlock();
    const [senderBalanceAfter, paraSovAccBalanceAfter] = await network.relay.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnRelay, 'Relay']]);
    const [receiverBalanceAfter] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);
    expect(senderBalanceAfter).toBeLessThan(senderBalanceBefore);
    expect(receiverBalanceAfter).toBeGreaterThan(receiverBalanceBefore!);
    // It's less than because of fees.
    expect(paraSovAccBalanceAfter).toBeLessThan(paraSovAccBalanceBefore + transferAmount);
  }, 100_000);

  test('from para to AH', async () => {
    // Setup.
    await network.parachain.setTokens([[aliceAddress, 'Para', '10000000000000'], [aliceAddress, 'Relay', '10000000000000']]);
    await network.assetHub.setTokens([[aliceAddress, 'Relay', '0'], [network.paraSovAccOnAssetHub, 'Relay', '10000000000000']]);
    const [senderBalanceBefore] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);
    const [receiverBalanceBefore, paraSovAccBalanceBefore] = await network.assetHub.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnAssetHub, 'Relay']]);

    // Transfer 1 WND from Penpal to Asset Hub.
    const transferAmount = 1_000_000_000_000n;
    const tx = fromParachainToAssetHub(network.parachain.api, transferAmount, alice.publicKey);
    const result = await tx.signAndSubmit(alice);

    // Assertions.
    expect(result.ok).toBe(false);
    await network.assetHub.context.dev.newBlock();
    const [senderBalanceAfter] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);
    const [receiverBalanceAfter, paraSovAccBalanceAfter] = await network.assetHub.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnAssetHub, 'Relay']]);
    // This doesn't decrease because fees are paid in PEN.
    expect(senderBalanceAfter).toBe(senderBalanceBefore!);
    // This stays the same since transfer failed.
    expect(receiverBalanceAfter).toBe(receiverBalanceBefore);
    // Same with the parachain's sovereign account on Asset Hub.
    expect(paraSovAccBalanceAfter).toBe(paraSovAccBalanceBefore);
  }, 100_000);

  test('from AH to para', async () => {
    // Setup.
    await network.assetHub.setTokens([[aliceAddress, 'Relay', '10000000000000'], [network.paraSovAccOnAssetHub, 'Relay', '0']]);
    await network.parachain.setTokens([[aliceAddress, 'Para', '10000000000000'], [aliceAddress, 'Relay', '0']]);
    const [senderBalanceBefore, paraSovAccBalanceBefore] = await network.assetHub.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnAssetHub, 'Relay']]);
    const [receiverBalanceBefore] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);

    // Transfer 1 WND from Asset Hub to Penpal.
    const transferAmount = 1_000_000_000_000n;
    const tx = fromAssetHubToParachain(network.assetHub.api, transferAmount, alice.publicKey);
    const result = await tx.signAndSubmit(alice);

    // Assertions.
    expect(result.ok).toBe(true);
    await network.parachain.context.dev.newBlock();
    const [senderBalanceAfter, paraSovAccBalanceAfter] = await network.assetHub.getTokens([[aliceAddress, 'Relay'], [network.paraSovAccOnAssetHub, 'Relay']]);
    const [receiverBalanceAfter] = await network.parachain.getTokens([[aliceAddress, 'Relay']]);
    // Decreases only because fees are paid in WND on Asset Hub.
    expect(senderBalanceAfter).toBeLessThan(senderBalanceBefore);
    // Since the transfer fails, this stays the same.
    expect(receiverBalanceAfter).toBe(receiverBalanceBefore!);
    // The transfer fails in the receiver, so the assets ARE deposited to the sovereign account.
    expect(paraSovAccBalanceAfter).toBeGreaterThan(paraSovAccBalanceBefore);
  }, 100_000);
});
