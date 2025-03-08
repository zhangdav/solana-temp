import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Keypair } from '@solana/web3.js'
import { Tokenlottery } from '../target/types/tokenlottery'

describe('tokenlottery', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Tokenlottery as Program<Tokenlottery>
 
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
  })
})