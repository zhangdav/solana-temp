import { Lending } from "../target/types/lending";
import { describe, it } from "node:test";
import { ProgramTestContext, startAnchor, BanksClient } from "solana-bankrun";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { BankrunContextWrapper } from "../bankrun-utils/bankrunConnection";
import { BN, Program } from "@coral-xyz/anchor";
import { createAccount, createMint, mintTo } from "spl-token-bankrun";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
// @ts-ignore
import IDL from "../target/idl/lending.json";

describe("Lending Smart Contract Tests", async () => {
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let bankrunConnection: BankrunContextWrapper;
  let program: Program<Lending>;
  let banksClient: BanksClient;
  let signer: Keypair;
  let usdcBankAccount: PublicKey;
  let solBankAccount: PublicKey;

  const pyth = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE")

  const devnetConnection = new Connection("https://api.devnet.solana.com")
  const accountInfo = await devnetConnection.getAccountInfo(pyth);

  context = await startAnchor(
    "", 
    [{ name: "lending", programId: new PublicKey(IDL.address) }],
    [{ address: pyth, info: accountInfo }]
  );

  provider = new BankrunProvider(context);

  const SOL_PRICE_ID = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

  bankrunConnection = new BankrunContextWrapper(context);

  const connection = bankrunConnection.connection.toConnection();

  const pythSolanaReceiver = new PythSolanaReceiver({connection, wallet: provider.wallet});

  const solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_ID);

  const feedAccountInfo = await devnetConnection.getAccountInfo(solUsdPriceFeedAccount);

  context.setAccount(solUsdPriceFeedAccount, feedAccountInfo);

  program = new Program<Lending>(IDL, provider);

  banksClient = context.banksClient;

  signer = provider.wallet.payer;

  // @ts-ignore
  const mintUSDC = await createMint(banksClient, signer, signer.publicKey, null, 2);

  // @ts-ignore
  const mintSOL = await createMint(banksClient, signer, signer.publicKey, null, 2);

  [usdcBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mintUSDC.toBuffer()],
    program.programId
  );

  [solBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mintSOL.toBuffer()],
    program.programId
  );

  it("Test Init and Fund Bank", async () => {
    const initUSDCBankTx = await program.methods
      .initBank(new BN(1), new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed"});

      console.log("Create USDC Bank Account:", initUSDCBankTx);

      const amount = 10_000 * 10 ** 9;

      const mintTx = await mintTo(
        // @ts-ignore
        banksClient,
        signer,
        mintUSDC,
        usdcBankAccount,
        signer,
        amount
      );

      console.log("Mint USDC to Bank:", mintTx);
  })

  it("Test Init user", async () => {
    const initUserTx = await program.methods.initUser(mintUSDC).accounts({
      signer: signer.publicKey,
    }).rpc({ commitment: "confirmed"});

    console.log("Init User:", initUserTx);
  })

  it("Test Init and Fund Sol Bank", async () => {
    const initSOLBankTx = await program.methods
    .initBank(new BN(2), new BN(1))
    .accounts({
      signer: signer.publicKey,
      mint: mintSOL,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc({ commitment: "confirmed"});

    console.log("Create SOL Bank Account:", initSOLBankTx);

    const amount = 10_000 * 10 ** 9;

    const mintTx = await mintTo(
      // @ts-ignore
      banksClient,
      signer,
      mintSOL,
      solBankAccount,
      signer,
      amount
    );

    console.log("Mint SOL to Bank:", mintTx);
  })

  it("Create and Fund Token Account", async () => {
    const USDCTokenAccount = await createAccount(
      // @ts-ignore
      banksClient,
      signer,
      mintUSDC,
      signer.publicKey,
    );

    console.log("USDC Token Account:", USDCTokenAccount);

    const amount = 10_000 * 10 ** 9;

    const mintUSDCTx = await mintTo(
      // @ts-ignore
      banksClient,
      signer,
      mintUSDC,
      USDCTokenAccount,
      signer,
      amount
    );

    console.log("Mint USDC to User Token Account:", mintUSDCTx);
  })

  it("Test Deposit USDC to Bank", async () => {
    const depositUSDCTx = await program.methods.deposit(new BN(100000000000)).accounts({
      signer: signer.publicKey,
      mint: mintUSDC,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc({ commitment: "confirmed"});
    
    console.log("Deposit USDC to Bank:", depositUSDCTx);
  })

  it("Test Borrow SOL from Bank", async () => {
    const borrowSOLTx = await program.methods.borrow(new BN(1)).accounts({
      signer: signer.publicKey,
      mint: mintSOL,
      tokenProgram: TOKEN_PROGRAM_ID,
      priceUpdate: solUsdPriceFeedAccount,
    }).rpc({ commitment: "confirmed"});

    console.log("Borrow SOL from Bank:", borrowSOLTx);
  })

  it("Test Repay SOL to Bank", async () => {
    const repaySOLTx = await program.methods.repay(new BN(1)).accounts({
      signer: signer.publicKey,
      mint: mintSOL,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc({ commitment: "confirmed"});

    console.log("Repay SOL to Bank:", repaySOLTx);
  })

  it("Test Withdraw USDC from Bank", async () => {
    const withdrawUSDCTx = await program.methods.withdraw(new BN(100)).accounts({
      signer: signer.publicKey,
      mint: mintUSDC,
      tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc({ commitment: "confirmed"});

    console.log("Withdraw USDC from Bank:", withdrawUSDCTx);
  })
})