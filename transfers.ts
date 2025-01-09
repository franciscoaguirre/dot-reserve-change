import { pen, wnd, wndAh, XcmV3Junction, XcmV3Junctions, XcmV3MultiassetFungibility, XcmV3WeightLimit, XcmV4AssetAssetFilter, XcmV4AssetWildAsset, XcmV4Instruction, XcmVersionedXcm } from "@polkadot-api/descriptors";
import { FixedSizeBinary, type Transaction, type TypedApi } from "polkadot-api";

export const fromParachainToRelay = (api: TypedApi<typeof pen>, transferAmount: bigint, beneficiary: Uint8Array): Transaction<any, any, any, any> => {
  return api.tx.PolkadotXcm.execute({
    message: XcmVersionedXcm.V4([
      XcmV4Instruction.WithdrawAsset([{
        id: { parents: 1, interior: XcmV3Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(transferAmount),
      }]),
      XcmV4Instruction.InitiateReserveWithdraw({
        assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
        reserve: { parents: 1, interior: XcmV3Junctions.Here() },
        xcm: [
          XcmV4Instruction.BuyExecution({
            fees: {
              id: { parents: 0, interior: XcmV3Junctions.Here() },
              fun: XcmV3MultiassetFungibility.Fungible(transferAmount / 2n),
            },
            weight_limit: XcmV3WeightLimit.Unlimited(),
          }),
          XcmV4Instruction.DepositAsset({
            assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
            beneficiary: { parents: 0, interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({ network: undefined, id: FixedSizeBinary.fromBytes(beneficiary) })) }
          }),
        ],
      }),
    ]),
    max_weight: { ref_time: 2_000_000_000n, proof_size: 200_000n },
  });
}

export const fromRelayToParachain = (api: TypedApi<typeof wnd>, transferAmount: bigint, beneficiary: Uint8Array): Transaction<any, any, any, any> => {
  return api.tx.XcmPallet.execute({
    message: XcmVersionedXcm.V4([
      XcmV4Instruction.WithdrawAsset([{
        id: { parents: 0, interior: XcmV3Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(transferAmount),
      }]),
      XcmV4Instruction.DepositReserveAsset({
        assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
        dest: { parents: 0, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(2042)) },
        xcm: [
          XcmV4Instruction.BuyExecution({
            fees: {
              id: { parents: 1, interior: XcmV3Junctions.Here() },
              fun: XcmV3MultiassetFungibility.Fungible(transferAmount / 2n),
            },
            weight_limit: XcmV3WeightLimit.Unlimited(),
          }),
          XcmV4Instruction.DepositAsset({
            assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
            beneficiary: { parents: 0, interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({ network: undefined, id: FixedSizeBinary.fromBytes(beneficiary) })) }
          }),
        ],
      }),
    ]),
    max_weight: { ref_time: 2_000_000_000n, proof_size: 200_000n },
  });
}

export const fromParachainToAssetHub = (api: TypedApi<typeof pen>, transferAmount: bigint, beneficiary: Uint8Array): Transaction<any, any, any, any> => {
  return api.tx.PolkadotXcm.execute({
    message: XcmVersionedXcm.V4([
      XcmV4Instruction.WithdrawAsset([{
        id: { parents: 1, interior: XcmV3Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(transferAmount),
      }]),
      XcmV4Instruction.InitiateReserveWithdraw({
        assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
        reserve: { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(1000)) },
        xcm: [
          XcmV4Instruction.BuyExecution({
            fees: {
              id: { parents: 1, interior: XcmV3Junctions.Here() },
              fun: XcmV3MultiassetFungibility.Fungible(transferAmount / 2n),
            },
            weight_limit: XcmV3WeightLimit.Unlimited(),
          }),
          XcmV4Instruction.DepositAsset({
            assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
            beneficiary: { parents: 0, interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({ network: undefined, id: FixedSizeBinary.fromBytes(beneficiary) })) }
          }),
        ],
      }),
    ]),
    max_weight: { ref_time: 2_000_000_000n, proof_size: 200_000n },
  });
}

export const fromAssetHubToParachain = (api: TypedApi<typeof wndAh>, transferAmount: bigint, beneficiary: Uint8Array): Transaction<any, any, any, any> => {
  return api.tx.PolkadotXcm.execute({
    message: XcmVersionedXcm.V4([
      XcmV4Instruction.WithdrawAsset([{
        id: { parents: 1, interior: XcmV3Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(transferAmount),
      }]),
      XcmV4Instruction.DepositReserveAsset({
        assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
        dest: { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(2042)) },
        xcm: [
          XcmV4Instruction.BuyExecution({
            fees: {
              id: { parents: 1, interior: XcmV3Junctions.Here() },
              fun: XcmV3MultiassetFungibility.Fungible(transferAmount / 2n),
            },
            weight_limit: XcmV3WeightLimit.Unlimited(),
          }),
          XcmV4Instruction.DepositAsset({
            assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
            beneficiary: { parents: 0, interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({ network: undefined, id: FixedSizeBinary.fromBytes(beneficiary) })) }
          }),
        ],
      }),
    ]),
    max_weight: { ref_time: 2_000_000_000n, proof_size: 200_000n },
  });
};
