import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Tokenlottery } from '../target/types/tokenlottery'
import * as sb from "@switchboard-xyz/on-demand";
import SwitchboardIDL from "../switchboard.json"

describe('tokenlottery', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Tokenlottery as Program<Tokenlottery>;

  // let switchboardProgram: anchor.Program<any>;
  const switchboardProgram = new anchor.Program(SwitchboardIDL as anchor.Idl, provider);
  const rngKp = anchor.web3.Keypair.generate();

  // beforeAll(async () => {
  //   const switchboardIDL = await anchor.Program.fetchIdl(
  //     sb.SB_ON_DEMAND_PID,
  //     {connection: new anchor.web3.Connection("https://mainnet.helius-rpc.com/?api-key=c5730fdb-3471-42ff-92ad-97256fa83871")}
  //   ) as anchor.Idl;

  //   var fs = require("fs");
  //   fs.writeFileSync("switchboard.json", JSON.stringify(switchboardIDL, function(err) {
  //     if (err) {
  //       console.error(err);
  //     }
  //   }));

  //   switchboardProgram = new anchor.Program(switchboardIDL, provider);
  // })
  
  async function buyTicket() {
    const buyTicketIx = await program.methods.buyTicket().accounts({
      tokenProgram: TOKEN_PROGRAM_ID
    }).instruction();

    const computeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({units: 1000000});

    const priorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({microLamports: 1});

    const blockhashWithContext = await provider.connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction(
      {
        feePayer: provider.wallet.publicKey,
        blockhash: blockhashWithContext.blockhash,
        lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
      }
    ).add(buyTicketIx)
    .add(computeIx)
    .add(priorityIx);

    const signature = await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [wallet.payer], {skipPreflight: true});
    console.log('Your transaction signature', signature);
  }

  it('should init', async () => {
    const slot = await provider.connection.getSlot();
    const endSlot = slot + 20;

    const initConfigIx = await program.methods.initialize(
      new anchor.BN(slot),
      new anchor.BN(endSlot),
      new anchor.BN(10000),
    ).instruction();

    const blockhashWithContext = await provider.connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction(
      {
        feePayer: provider.wallet.publicKey,
        blockhash: blockhashWithContext.blockhash,
        lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
      }
    ).add(initConfigIx);

    const signature = await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [wallet.payer]);
    console.log('Buy ticket signature', signature);

    const initLotteryIx = await program.methods.initializeLottery().accounts({
      tokenProgram: TOKEN_PROGRAM_ID
    }).instruction();

    const initLotteryTx = new anchor.web3.Transaction(
      {
        feePayer: provider.wallet.publicKey,
        blockhash: blockhashWithContext.blockhash,
        lastValidBlockHeight: blockhashWithContext.lastValidBlockHeight,
      }
    ).add(initLotteryIx);

    const initiLotterySignature = await anchor.web3.sendAndConfirmTransaction(provider.connection, initLotteryTx, [wallet.payer], {skipPreflight: true});

    console.log('Your initLottery signature', initiLotterySignature);

    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();
    await buyTicket();

    const queue = new anchor.web3.PublicKey("A43DyUGA7s8eXPxqEjJY6EBu1KKbNgfxF8h17VAHn13w");

    const queueAccount = new sb.Queue(switchboardProgram, queue);
    console.log("Queue account", queue.toString());
    try {
      await queueAccount.loadData();
    } catch (err) {
      console.log("Queue account not found");
      process.exit(1);
    }

    const [randomness, createRandomnessIx] = await sb.Randomness.create(switchboardProgram, rngKp, queue);

    const createRandomnessTx = await sb.asV0Tx({
      connection: provider.connection,
      ixs: [createRandomnessIx],
      payer: wallet.publicKey,
      signers: [wallet.payer, rngKp]
    });

    const createRandomnessSignature = await provider.connection.sendTransaction(createRandomnessTx);

    console.log("Your createRandomness signature", createRandomnessSignature);

    let confirmed = false;

    while (!confirmed) {
      try {
        const confirmedRandomness = await provider.connection.getSignatureStatuses([createRandomnessSignature]);
        const randomnessStatus = confirmedRandomness.value[0];
        if (randomnessStatus?.confirmations != null && randomnessStatus.confirmationStatus === 'confirmed') {
          confirmed = true;
        }
      } catch (error) {
        console.log('Error', error);
      }
    }

    const sbCommitIx = await randomness.commitIx(queue);

    const commitIx = await program.methods.commitRandomness().accounts({
      randomnessAccount: randomness.pubkey
    }).instruction();

    const commitComputeIx = anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 100000
    });

    const commitPriorityIx = anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    });

    const commitBlockhashWithContext = await provider.connection.getLatestBlockhash();
    const commitTx = new anchor.web3.Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash: commitBlockhashWithContext.blockhash,
      lastValidBlockHeight: commitBlockhashWithContext.lastValidBlockHeight,
    })
      .add(commitComputeIx)
      .add(commitPriorityIx)
      .add(sbCommitIx)
      .add(commitIx);

    const commitSignature = await anchor.web3.sendAndConfirmTransaction(
      provider.connection, commitTx, [wallet.payer]
    );
    console.log("Commit randomness signature", commitSignature);

    const sbRevealIx = await randomness.revealIx();

    const revealWinnerIx = await program.methods.revealWinner()
      .accounts({
        randomnessAccount: randomness.pubkey
      }).instruction();

    const revealBlockhashWithContext = await provider.connection.getLatestBlockhash();

    const revealTx = new anchor.web3.Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash: revealBlockhashWithContext.blockhash,
      lastValidBlockHeight: revealBlockhashWithContext.lastValidBlockHeight,
    }).add(sbRevealIx).add(revealWinnerIx);

    let currentSlot = 0;
    while (currentSlot < endSlot) {
      const slot = await provider.connection.getSlot();
      if (slot > currentSlot) {
        currentSlot = slot;
        console.log("Current slot", currentSlot);
      }
    }

    const revealSignature = await anchor.web3.sendAndConfirmTransaction(
      provider.connection, revealTx, [wallet.payer]
    );

    console.log("Reveal winner signature", revealSignature);

    const claimIx = await program.methods.claimWinnings().accounts({
      tokenProgram: TOKEN_PROGRAM_ID
    }).instruction();

    const claimBlockhashWithContext = await provider.connection.getLatestBlockhash();

    const claimTx = new anchor.web3.Transaction({
      feePayer: provider.wallet.publicKey,
      blockhash: claimBlockhashWithContext.blockhash,
      lastValidBlockHeight: claimBlockhashWithContext.lastValidBlockHeight,
    }).add(claimIx);

    const claimSignature = await anchor.web3.sendAndConfirmTransaction(
      provider.connection, claimTx, [wallet.payer], {skipPreflight: true}
    );

    console.log("Claim winnings signature", claimSignature);

  }, 300000)
})