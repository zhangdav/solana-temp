import { PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BanksClient, ProgramTestContext, startAnchor, Clock } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import IDL from "../target/idl/tokenvesting.json";

import { Tokenvesting } from "../target/types/tokenvesting"; 
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { Program, BN } from "@coral-xyz/anchor";
// @ts-ignore
import { createMint, mintTo } from "spl-token-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

describe("Vesting Smart Contract Tests", () => {
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
  let treasuryTokenAccountKey: PublicKey;
  let employeeAccountKey: PublicKey;
  let companyName = "companyName";

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();
 
    context = await startAnchor(
      "",
      [
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
          },
        },
      ]
    );

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);

    program = new Program<Tokenvesting>(IDL as Tokenvesting, provider);
    banksClient = context.banksClient;

    employer = provider.wallet.payer;

    mint = await createMint(banksClient, employer, employer.publicKey, null, 2);

    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Tokenvesting>(IDL as Tokenvesting, beneficiaryProvider);

    // PDA for vesting account
    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId,
    );

    // PDA for treasury token account
    [treasuryTokenAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
      program.programId,
    );

    // PDA for employee account
     [employeeAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from("employee_vesting"), beneficiary.publicKey.toBuffer(), vestingAccountKey.toBuffer()],
      program.programId
     );
  })

  it("should create vesting account", async () => {
    const tx = await program.methods.createVestingAccount(companyName).accounts({
      signer: employer.publicKey,
      mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc({commitment: "confirmed"});

    const vestingAccountData = await program.account.vestingAccount.fetch(vestingAccountKey, "confirmed");

    console.log("Vesting Account Data:", vestingAccountData, null, 2);
    console.log("Created Vesting Account:", tx);
  })

  it("should fund the treasury token account", async () => {
    const amount = 10_000 * 10 ** 9;
    const mintTx = await mintTo(
      banksClient,
      employer,
      mint,
      treasuryTokenAccountKey,
      employer,
      amount,
    )
    console.log("Funded Treasury Token Account:", mintTx);
  })

  it("should create employee vesting account", async () => {
    const tx2 = await program.methods.createEmployeeAccount(
      new BN(0),
      new BN(100),
      new BN(50),
      new BN(1000),
    ).accounts({ beneficiary: beneficiary.publicKey, vestingAccount: vestingAccountKey }).rpc({commitment: "confirmed", skipPreflight: true});

    console.log("Created Employee Vesting Account:", tx2);
    console.log('Employee Account:', employeeAccountKey.toBase58());
  })

  it("should claim the employee's vested tokens", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const currentClock = await banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        BigInt(75),  // Set time to 75 seconds, which is after cliff (50) but before end (100)
      )
    );
    
    const tx3 = await program2.methods.claimTokens(companyName).accounts({ tokenProgram: TOKEN_PROGRAM_ID }).rpc({commitment: "confirmed"});

    console.log("Claim Tokens Tx:", tx3);
  })
})