import { ActionGetResponse, ACTIONS_CORS_HEADERS, ActionPostRequest, createPostResponse } from "@solana/actions"
import { PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import * as anchor from '@coral-xyz/anchor';
import { BN } from "@coral-xyz/anchor";

import idl from '@/../anchor/target/idl/voting.json';

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://zestfulkitchen.com/wp-content/uploads/2021/09/Peanut-butter_hero_for-web-2.jpg",
    title: "Vote for your favorite peanut butter!",
    description:"Vote between crunchy and smooth peanut butter.",
    label: "Vote",
    links: {
      actions: [
        {
          href: 'http://localhost:3000/api/vote?candidate=crunchy',
          label: 'Vote Crunchy',
          type: 'external-link', 
        },
        {
          href: 'http://localhost:3000/api/vote?candidate=smooth',
          label: 'Vote Smooth',
          type: 'external-link', 
        }
      ],
    },
  };

  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS})
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if(candidate !== 'crunchy' && candidate !== 'smooth') {
    return new Response('Invalid candidate', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const connection = new anchor.web3.Connection('http://127.0.0.1:8899', 'confirmed')
  const program: anchor.Program<Voting> = new anchor.Program(idl as Voting, {connection});


  const body: ActionPostRequest = await request.json()
  let voter;

  try {
    voter = new PublicKey(body.account)
  } catch (error) {
    return new Response('Invalid account', { status: 400, headers: ACTIONS_CORS_HEADERS })
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction()

    const blockhash = await connection.getLatestBlockhash()

    const transaction = new Transaction({
      feePayer: voter,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instruction)

    const response = await createPostResponse({
      fields: {
        transaction: transaction,
        type: 'transaction',
      }
    })

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS })
}
