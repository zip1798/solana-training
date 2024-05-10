import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import base58 from "bs58";

const keypair = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `✅ Finished! We've loaded our keypair securely, using an env file! Our public key is: ${keypair.publicKey.toBase58()}, Our private key is ${base58.encode(keypair.secretKey) }`
);
