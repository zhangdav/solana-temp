import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Keypair } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'
import * as sb from "@switchboard-xyz/on-demand";

describe('tokenlottery', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Tokenlottery as Program<Tokenlottery>

  let switchboardProgram: anchor.Program<anchor.Idl>;
  const rngKp = anchor.web3.Keypair.generate();
  
  beforeAll(async () => {
    const switchboardIDL = await anchor.Program.fetchIdl(
      sb.SB_ON_DEMAND_PID, 
      {connection: new anchor.web3.Connection("https://api.mainnet-beta.solana.com")}
    ) as anchor.Idl;

    // var fs = require('fs');
    // fs.writeFileSync('switchboard.json', JSON.stringify(switchboardIDL), function(err: any) {
    //   if (err) {
    //     console.log(err);
    //   }
    // }); 
    switchboardProgram = new anchor.Program(switchboardIDL, provider);
  });

  async function buyTicket() {
    const buyTicketIx = await program.methods.buyTicket()
      .accounts({
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

      const computeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 300000,
      });

      const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1,
      })

      const blockhashWithContext = await provider.connection.getLatestBlockhash();
      const tx = new anchor.web3.Transaction({
        feePayer: payer.publicKey,
        blockhash: blockhashWithContext.blockhash,
        lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
      }).add(buyTicketIx)
      .add(computeIx)
      .add(priorityIx);

      const signature = await anchor.web3.sendAndConfirmTransaction(
        provider.connection, tx, [payer.payer], {skipPreflight: true}
      );

      console.log("Your Buy Ticket signature", signature);
  }
 
  it('Initialize Tokenlottery', async () => {
    const initConfigIx = await program.methods.initializeConfig(
      new anchor.BN(0),
      new anchor.BN(1741259754),
      new anchor.BN(10000),
    ).instruction();

    const blockhashWithContext = await provider.connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction({
      feePayer: payer.publicKey,
      blockhash: blockhashWithContext.blockhash,
      lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
    }).add(initConfigIx);

    console.log('Your transaction signature', tx);

    const signature = await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      tx,
      [payer.payer]
    );

    console.log("Your transaction signature", signature);

    const initLotteryIx = await program.methods.initializeLottery().accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
    }).instruction();

    const initLotteryTx = new anchor.web3.Transaction(
      {
        feePayer: payer.publicKey,
        blockhash: blockhashWithContext.blockhash,
        lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
      }
    ).add(initLotteryIx);

    const initLotterySignaure = await anchor.web3.sendAndConfirmTransaction(
      provider.connection, initLotteryTx, [payer.payer], {skipPreflight: true}
    );

    console.log("Your initLottery signature", initLotterySignaure);

    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();

    const queue = new anchor.web3.PublicKey("A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w");

    const queueAccount = new sb.Queue(switchboardProgram, queue);

    try {
      await queueAccount.loadData();
    } catch (error) {
      console.log('Error', error);
      process.exit(1);
    }

    const [randomness, createRandomnessIx] = await sb.Randomness.create(switchboardProgram, rngKp, queue);

    const createRandomnessTx = await sb.asV0Tx({
      connection: provider.connection,
      ixs: [createRandomnessIx],
      payer: payer.publicKey,
      signers: [payer.payer, rngKp]
    });

    const createRandomnessSignature = await provider.connection.sendTransaction(createRandomnessTx);

    console.log("Your createRandomness signature", createRandomnessSignature);
  })
})