import { findMetadataPda, fetchDigitalAsset, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";

// Initialize connection
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load user and airdrop if required
const user = await getKeypairFromFile();
await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user", user.publicKey.toBase58());

// Create Umi instance
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// Set up Umi instance for user
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));
console.log("Set up Umi instance for user");

const collectionAddress = publicKey("2L4wVuEgXj7woPuAH9y1wJDaunWs4oSujMJg5JMgVuZv");
const nftAddress = publicKey("HqduNfpYKQNyehV55RbenZbs67iUKN3UW8LBZZwoyxJf");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity
});

await transaction.sendAndConfirm(umi);
console.log(
    `✅ NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
      "address",
      nftAddress,
      "devnet"
    )}`
  );
