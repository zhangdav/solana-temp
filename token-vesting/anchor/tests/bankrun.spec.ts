import { PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

import IDL from "../target/idl/tokenvesting.json";
import { Tokenvesting } from "../target/types/tokenvesting"; 
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Program } from "@coral-xyz/anchor";

describe("Vesting Smart Contract Tests", () => {
  let beneficiary: Keypair;
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Tokenvesting>;
  let BanksClient: BanksClient;

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();

    context = await startAnchor('', [
      { name: 'vesting', programId: new PublicKey(IDL.address) },
    ],
    [
      {
        address: beneficiary.publicKey,
        info: {
          lamports: 1_000_000_000,
          data: Buffer.alloc(0),
          owner: SYSTEM_PROGRAM_ID,
          executable: false,
        }
      }
    ]
  );

    provider = new BankrunProvider(context);

    anchor.setProvider(provider);

    program = new Program<Tokenvesting>(IDL as Tokenvesting, provider)

    BanksClient = context.banksClient;
  })
})     