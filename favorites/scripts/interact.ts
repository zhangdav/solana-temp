import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";
//@ts-ignore
import IDL from "../target/idl/favorites.json";

dotenv.config();

const programId = new PublicKey(process.env.PROGRAM_ID);

const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

const wallet = new anchor.Wallet(Keypair.fromSecretKey(
  Buffer.from(JSON.parse(readFileSync(process.env.WALLET_PATH, "utf-8")))
));

const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
  preflightCommitment: "confirmed",
});

anchor.setProvider(provider);

const program = new Program(IDL, provider);

async function getFavoritesPDA(userPublicKey: PublicKey): Promise<[PublicKey, number]> {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("favorites"), userPublicKey.toBuffer()],
    programId
  );
}

async function setFavorites(
  number: number,
  color: string,
  hobbies: string[]
): Promise<string> {
  try {
    // Get user's PDA
    const [favoritesPDA] = await getFavoritesPDA(wallet.publicKey);

    console.log("User public key:", wallet.publicKey.toString());
    console.log("Favorites PDA:", favoritesPDA.toString());

    // Call the set_favorites method of the contract
    const tx = await program.methods
      .setFavorites(
        new anchor.BN(number),
        color,
        hobbies
      )
      .accounts({
        user: wallet.publicKey,
        favorites: favoritesPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction successful:", tx);
    return tx;
  } catch (error) {
    console.error("Failed to set favorites:", error);
    throw error;
  }
}

async function main() {
  try {
    await setFavorites(42, "blue", ["reading", "programming", "traveling"]);
  } catch (error) {
    console.error("Program execution failed:", error);
  }
}

main();