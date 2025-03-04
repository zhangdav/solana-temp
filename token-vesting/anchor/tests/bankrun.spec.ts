import { PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import IDL from "../target/idl/tokenvesting.json";

import { Tokenvesting } from "../target/types/tokenvesting"; 
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Program } from "@coral-xyz/anchor";
// @ts-ignore
import { createMint } from "spl-token-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

describe("Vesting Smart Contract Tests", ()  => {
  const companyName = "companyName";
  let beneficiary: Keypair;
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Tokenvesting>;
  let banksClient: BanksClient;
  let employer: Keypair;
  let mint: PublicKey;
  let beneficiaryProvider: BankrunProvider;
  let program2: Program<Tokenvesting>;
  let vestingAccountKey: PublicKey;
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();

    context = await startAnchor('', [
      { name: 'tokenvesting', programId: new PublicKey(IDL.address) },
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

    banksClient = context.banksClient;

    employer = provider.wallet.payer;

    // @ts-ignore
    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Tokenvesting>(IDL as Tokenvesting, beneficiaryProvider);

    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId
    );

    [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('vesting_treasury'), Buffer.from(companyName)],
      program.programId
    );

    [employeeAccount] = PublicKey.findProgramAddressSync([
      Buffer.from('employee_vesting'), 
      beneficiary.publicKey.toBuffer(), 
      vestingAccountKey.toBuffer(),
    ],
      program.programId
    );
  });

  it("should create a vesting account", async () => {
    const tx = await program.methods
      .createVestingAccount(companyName)
      .accounts({
        signer: employer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      }).rpc({ commitment: 'confirmed' });

    const vestingAccountData = await program.account.vestingAccount.fetch(vestingAccountKey, 'confirmed');

    console.log('Vesting Account Data:', vestingAccountData, null, 2);
    console.log('Create Vesting Account:', tx);
  });
});