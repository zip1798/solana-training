import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

const sender = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`
);

// Subtitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey(
    "AjVTGh5ko5Mzw7FEn7tRwKFqY86cEBExaMaktDDgydKd", // "gxqs2jApgRZRaJYYbboqFFvwvXAyMb9oicutbKku5CB"
);
  
// Subtitute in a recipient from addresses.ts
const recipient = new PublicKey("38cvwBzWceVamUfnTm85hn3LsDpZhpZ6EwmsQU6M53C8");
  
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  recipient
);
  
  console.log(`Token Account: ${tokenAccount.address.toBase58()}`);
  
  const link = getExplorerLink(
    "address",
    tokenAccount.address.toBase58(),
    "devnet"
  );
  
  console.log(`✅ Created token Account: ${link}`);

  /**
   * Token Account: FSnxSitg4Xr74VGYDrY3kjhoQHob3YKuxY21LuLGw6xP
   * Created token Account: https://explorer.solana.com/address/FSnxSitg4Xr74VGYDrY3kjhoQHob3YKuxY21LuLGw6xP?cluster=devnet
   * 
   */