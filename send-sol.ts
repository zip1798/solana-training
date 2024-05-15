import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  TransactionInstruction
} from "@solana/web3.js";

const sender = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`
);

const recipient = new PublicKey('EL3rUAB6ggt3dXVAcuctAjUDkjbdBX7NeFpUCyZzMYNm');

console.log(`💸 Attempting to send 0.01 SOL to ${recipient.toBase58()}...`);

const transaction = new Transaction();

const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: sender.publicKey,
  toPubkey: recipient,
  lamports: 0.015 * LAMPORTS_PER_SOL,
});

transaction.add(sendSolInstruction);

// Get this address from https://spl.solana.com/memo
const memoProgram = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const memoText = "Hello from Solana!";

const addMemoInstruction = new TransactionInstruction({
  keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: true }],
  data: Buffer.from(memoText, "utf-8"),
  programId: memoProgram,
});

transaction.add(addMemoInstruction);

console.log(`📝 memo is ${memoText}...`);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  sender,
]);

console.log(`✅ Transaction confirmed, signature: ${signature}!`);

