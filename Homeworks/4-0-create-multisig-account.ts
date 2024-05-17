import { createMultisig } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const sender = getKeypairFromEnvironment("SECRET_KEY");

const multisigAccount = await createMultisig(
  connection,
  sender,
  [
    sender.publicKey, // B5EucqcybsSdvP2CYQzJwmKDmTLgPMWnY2Gswjv4LwNb
    new PublicKey("5Txp2wximDXu9ZLxYPqSnDVoLxL6JaiX9x8XRVfjHWDx"), // SECRET_KEY2
    new PublicKey("8ax4njhKkdMLidApzhLy4nRXdjusNLYUccBLmFq8VsQa"), // SECRET_KEY3
  ],
  2
);

const link = getExplorerLink("address", multisigAccount.toString(), "devnet");
  
console.log(`✅ Create Multisig Account transaction: ${link}`);

/**
 * Create Multisig Account transaction: https://explorer.solana.com/address/25j6TspMDFjUVBpvwYzr841hpnJkicc5mhRc6TzcfhGo?cluster=devnet
 * Address: 25j6TspMDFjUVBpvwYzr841hpnJkicc5mhRc6TzcfhGo
 * 
 * Token Mint: https://explorer.solana.com/address/CnQMvUDcQpzDHsV5CeFmAh322sUh2PwJwU5aWyD4fJdS?cluster=devnet
 * Address: CnQMvUDcQpzDHsV5CeFmAh322sUh2PwJwU5aWyD4fJdS
 * 
 */