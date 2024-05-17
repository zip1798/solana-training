import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const sender = getKeypairFromEnvironment("SECRET_KEY");
const multisigSigner2 = getKeypairFromEnvironment("SECRET_KEY2");
const multisigSigner3 = getKeypairFromEnvironment("SECRET_KEY3");

// Multisig token account
const tokenMintAccount = new PublicKey(
  "CnQMvUDcQpzDHsV5CeFmAh322sUh2PwJwU5aWyD4fJdS"
);

const recipientAssociatedTokenAccount = new PublicKey(
  "B5EucqcybsSdvP2CYQzJwmKDmTLgPMWnY2Gswjv4LwNb" // SECRET_KEY (for test)
);
const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  recipientAssociatedTokenAccount
);

const authorityAccount = new PublicKey(
  "25j6TspMDFjUVBpvwYzr841hpnJkicc5mhRc6TzcfhGo"
)

const transactionSignature = await mintTo(
  connection, 
  sender, // who pays for the transaction
  tokenMintAccount, // our token mint
  associatedTokenAccount.address, // our recipient
  authorityAccount, // our mint authority account
  8888 * MINOR_UNITS_PER_MAJOR_UNITS, // amount
  [multisigSigner2, multisigSigner3] // array of multisig signers
);

const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log(`✅ Success! Mint Token Transaction: ${link}`);

/**
 * Result:
 * ✅ Success! Mint Token Transaction: https://explorer.solana.com/tx/52cU4USHZ3TC8f8u7mppDbeDfiPuxRcL2Hxe4wqa8wE9A6SKiASgCfH1GDMRNdEZTJS4gnAAWpWVFjKSND6NCpSZ?cluster=devnet
 */
