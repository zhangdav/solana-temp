import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {PublicKey} from '@solana/web3.js'
import {Voting} from '../target/types/voting'
import {startAnchor} from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'

const IDL = require('../target/idl/voting.json');

const votingAddress = new PublicKey("FpTkhPPEsZHVa5d1NjV87MuHR8s6jSQxX5iB12mSbM6s");

describe('Voting', () => {
  it('Initialize Poll', async () => {
    const context = await startAnchor("", [{ name: "voting", programId: votingAddress}], []);
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite type of peanut butter?",
      new anchor.BN(0),
      new anchor.BN(1847402430),
    ).rpc();
  })
})
