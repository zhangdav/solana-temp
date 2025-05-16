import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {PublicKey} from '@solana/web3.js'
import {Voting} from '../target/types/voting'
import {startAnchor} from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'

const IDL = require('../target/idl/voting.json');

const votingAddress = new PublicKey("FpTkhPPEsZHVa5d1NjV87MuHR8s6jSQxX5iB12mSbM6s");

describe('Voting', () => {
  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll( async () => {
    context = await startAnchor("", [{ name: "voting", programId: votingAddress}], []);
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL, provider);
  })

  it('Initialize Poll', async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite type of peanut butter?",
      new anchor.BN(0),
      new anchor.BN(1847402430),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll); 

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite type of peanut butter?");
    expect(poll.pollStart.toNumber()).toEqual(0);
    expect(poll.pollEnd.toNumber()).toEqual(1847402430);
    expect(poll.candidateAmount.toNumber()).toEqual(0);
  });

  it("initialize candidate", async () => {
    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1),
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).rpc();

  const [pollAddress] = PublicKey.findProgramAddressSync(
    [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
    votingAddress,
  );
  const poll = await votingProgram.account.poll.fetch(pollAddress);
  console.log(poll);

  const [SmoothAddress] = PublicKey.findProgramAddressSync(
    [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
    votingAddress,
  );
  const SmoothCandidate = await votingProgram.account.candidate.fetch(SmoothAddress);
  console.log(SmoothCandidate);

  const [CrunchyAddress] = PublicKey.findProgramAddressSync(
    [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
    votingAddress,
  );
  const CrunchyCandidate = await votingProgram.account.candidate.fetch(CrunchyAddress);
  console.log(CrunchyCandidate);

  expect(SmoothCandidate.candidateName).toEqual("Smooth");
  expect(CrunchyCandidate.candidateName).toEqual("Crunchy");
  expect(SmoothCandidate.candidateVotes.toNumber()).toEqual(0);
  expect(CrunchyCandidate.candidateVotes.toNumber()).toEqual(0);
  expect(poll.candidateAmount.toNumber()).toEqual(2);
});

  it("vote", async () => {
    await votingProgram.methods.vote(
      "Smooth",
      new anchor.BN(1),
    ).rpc();

    const [SmoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
      votingAddress,
    );

    const SmoothCandidate = await votingProgram.account.candidate.fetch(SmoothAddress);
    console.log(SmoothCandidate);

    expect(SmoothCandidate.candidateName).toEqual("Smooth");
    expect(SmoothCandidate.candidateVotes.toNumber()).toEqual(1);
  });
})
