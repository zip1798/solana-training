import "dotenv/config";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
  SystemProgram
} from "@solana/web3.js";

import {
    getKeypairFromEnvironment,
    airdropIfRequired,
  } from "@solana-developers/helpers";
  
const connection = new Connection(clusterApiUrl("devnet"));

console.log(`⚡️ Connected to devnet`);

const publicKey = new PublicKey("B5EucqcybsSdvP2CYQzJwmKDmTLgPMWnY2Gswjv4LwNb");
/*
await airdropIfRequired(
    connection,
    publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
  );
//*/

const balanceInLamports = await connection.getBalance(publicKey);

const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
  `💰 Finished! The balance for the wallet at address ${publicKey} is ${balanceInSOL}!`
);

