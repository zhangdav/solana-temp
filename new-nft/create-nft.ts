import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
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

console.log("creating NFT...");

const mint = generateSigner(umi); 

const transaction = await createNft(umi, {
    mint,
    name: "My NFT",
    uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false,
    },
});

await transaction.sendAndConfirm(umi);

await new Promise(resolve => setTimeout(resolve, 2000));

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
console.log(`NFT created! Address is ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);