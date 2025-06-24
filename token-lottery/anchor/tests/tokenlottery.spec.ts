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
    const initConfigIx = await program.methods.initialize(
      new anchor.BN(0),
      new anchor.BN(1850767612),
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

  }, 300000)
})