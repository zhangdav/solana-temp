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

describe("Lending Smart Contract Test", async () => {
    let context: ProgramTestContext;
    let provider: BankrunProvider;
    let bankrunContextWrapper: BankrunContextWrapper;
    let program: Program<Lending>;
    let banksClient: BanksClient;
    let signer: Keypair;
    let usdcBankAccount: PublicKey;
    let solBankAccount: PublicKey;

    const pyth = new PublicKey("7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE");
    const devnetConnection = new Connection("https://api.devnet.solana.com");
    const accountInfo = await devnetConnection.getAccountInfo(pyth);

    context = await startAnchor(
    "",
    [{ name: "lending", programId: new PublicKey(IDL.address) }], 
    [{ address: pyth, info: accountInfo }]
  );

  provider = new BankrunProvider(context);

  const SOL_PRICE_FEED_ID = "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

  bankrunContextWrapper = new BankrunContextWrapper(context);

  const connection = bankrunContextWrapper.connection.toConnection();

  const pythSolanaReceiver = new PythSolanaReceiver({connection, wallet: provider.wallet});

  const solUsdPriceFeedAccount = pythSolanaReceiver.getPriceFeedAccountAddress(0, SOL_PRICE_FEED_ID);

  const feedAccountInfo = await devnetConnection.getAccountInfo(solUsdPriceFeedAccount);

  context.setAccount(solUsdPriceFeedAccount, feedAccountInfo);

  program = new Program<Lending>(IDL as Lending, provider);

  banksClient = context.banksClient;

  signer = provider.wallet.payer;

  const mintUSDC = await createMint(
    // @ts-ignore
    banksClient,
    signer,
    signer.publicKey,
    null,
    2
  );

  const mintSOL = await createMint(
    // @ts-ignore
    banksClient,
    signer,
    signer.publicKey,
    null,
    2
  );

  [usdcBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mintUSDC.toBuffer()],
    program.programId
  );

  [solBankAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury"), mintSOL.toBuffer()],
    program.programId
  );

  it("Test Init and fund Bank", async () => {
    const initUSDCBankTx = await program.methods.initBank(new BN(1), new BN(1)).accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc({ commitment: "confirmed"});

    console.log("Create USDC Bank Account", initUSDCBankTx);

    const amount = 10_000 * 10 ** 9;

    const mintTx = await mintTo(
        // @ts-ignore
        banksClient,
        signer,
        mintUSDC,
        usdcBankAccount,
        signer,
        amount
    )

    console.log("Mint USDC to Bank", mintTx);
  })

  it("Test Init User", async () => {
    const InitUserTx = await program.methods.initUser(mintUSDC).accounts({
        signer: signer.publicKey,
  }).rpc({ commitment: "confirmed"});

  console.log("Init User", InitUserTx);
  })

  it("Test Init and Fund Sol Bank", async () => {
    const InitSolBankTx = await program.methods.initBank(new BN(2), new BN(1)).accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
    }).rpc({ commitment: "confirmed"});

    console.log("Create Sol Bank Account", InitSolBankTx);

    const amount = 10_000 * 10 ** 9;

    const mintTx = await mintTo(
        // @ts-ignore
        banksClient,
        signer,
        mintSOL,
        solBankAccount,
        signer,
        amount
    )

    console.log("Mint Sol to Bank", mintTx);
  })

  it("Create and Fund Token Accounts", async () => {
    const USDCTokenAccount = await createAccount(
        // @ts-ignore
        banksClient,
        signer,
        mintUSDC,
        signer.publicKey
    );

    console.log("USDC Token Account", USDCTokenAccount);

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

    console.log("Mint USDC to Token Account", mintUSDCTx);
  })

  it("Test Deposit", async () => {
    const depositUSDC = await program.methods.deposit( new BN(100000000000)).accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID
    }).rpc({ commitment: "confirmed"});

    console.log("Deposit USDC", depositUSDC);
  })

  it("Test Borrow", async () => {
    const borrowSOL = await program.methods
      .borrow(new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
        priceUpdate: solUsdPriceFeedAccount,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Borrow SOL", borrowSOL);
  });

  it("Test Repay", async () => {
    const repaySOL = await program.methods
      .repay(new BN(1))
      .accounts({
        signer: signer.publicKey,
        mint: mintSOL,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Repay SOL", repaySOL);
  });

  it("Test Withdraw", async () => {
    const withdrawUSDC = await program.methods
      .withdraw(new BN(100))
      .accounts({
        signer: signer.publicKey,
        mint: mintUSDC,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });

    console.log("Withdraw USDC", withdrawUSDC);
  });
});