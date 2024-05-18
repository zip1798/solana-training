import { 
    mintTo, 
    getOrCreateAssociatedTokenAccount, 
    transfer, 
    createTransferCheckedInstruction 
} from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);
const TRANSFER_AMOUNT = 2700;

const sender = getKeypairFromEnvironment("SECRET_KEY");
const recipient = getKeypairFromEnvironment("SECRET_KEY2");

const mintPublicKey = new PublicKey(
  "gxqs2jApgRZRaJYYbboqFFvwvXAyMb9oicutbKku5CB"
);

// get sender token account
const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    mintPublicKey,
    sender.publicKey
);

// mint some tokens to sender
const transactionSignature = await mintTo(
    connection,
    sender,
    mintPublicKey,
    senderTokenAccount.address,
    sender,
    TRANSFER_AMOUNT
);
const linkMint = getExplorerLink("transaction", transactionSignature, "devnet");
console.log(`✅ Success! Mint Transaction: ${linkMint}\n`);

// get recipient token account
const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    mintPublicKey,
    recipient.publicKey
);
/*
// Simple Transfer

const transferSignature = await transfer(
    connection,
    sender,
    senderTokenAccount.address,
    recipientTokenAccount.address,
    sender.publicKey,
    TRANSFER_AMOUNT
);

const link = getExplorerLink("transaction", transferSignature, "devnet");
console.log(`✅ Success! Simple Transfer Transaction: ${link}`);
//*/

// Get a recent blockhash to include in the transaction
const { blockhash } = await connection.getLatestBlockhash("finalized");

const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: recipient.publicKey, // Recipient pays the transaction fee
});

transaction.add(
    createTransferCheckedInstruction(
      senderTokenAccount.address, // source
      mintPublicKey, // mint
      recipientTokenAccount.address, // destination
      sender.publicKey, // owner of source account
      TRANSFER_AMOUNT, // amount to transfer
      2
    )
);

transaction.partialSign(sender);

// Serialize the transaction and convert to base64 to return it
const serializedTransaction = transaction.serialize({
  // We will need recipient to deserialize and sign the transaction
  requireAllSignatures: false,
});
const transactionBase64 = serializedTransaction.toString("base64");
console.log(`Partial Sign Transaction: ${transactionBase64}\n`);

////////////////////////////////////////////////////////////////////////////////////////////
// Recipient part of the transaction

// Deserialize the transaction
const recoveredTransaction = Transaction.from(
  Buffer.from(transactionBase64, "base64")
);

recoveredTransaction.partialSign(recipient);
const recoveredTransactionSignature = await connection.sendRawTransaction(
    recoveredTransaction.serialize(),
  );

const linkRecoveredTransactionSignature = getExplorerLink("transaction", recoveredTransactionSignature, "devnet");
console.log(`✅ Success! Partial Transfer Transaction: ${linkRecoveredTransactionSignature}`);

/**
 * Result of execution:
 * 
 * ✅ Success! Mint Transaction: https://explorer.solana.com/tx/CLJjjqqMqVUtbQk7rt2aCnjUurPU38NS1gfW3upHf5mm1Q6R6MwUPTbvvndbwAECfNp188hr8D7D8hdCSMzibA4?cluster=devnet

Partial Sign Transaction: AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbwacfXfMnPb8XQ/nCQcs3Qj0h2jx9B1fVTWqMHrB9qO6hAMHeoDZk0svXQn8ZFA2Bbq9hJLL9MO+16eP1vOAAAgECBkJW9FCMQtXOkTSaKnQtmNTZLQugVpDAlDGczTtFdZfjlarq3HzI5d2HNkKkLo03+bp0X95vTttLFlFoBkiDvkSBoiAKiIM3udFTe1PuzQBrQ8KaUS+HzvMHpsdpkwrxGItTLEwIrQ/L/cXdoERbpsWLBcyYvMFpWWYsCnOIziFVCjzK9nAVPPRfWo5HcmEICjxo1TwbEN0N446gF4T2gCgG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqZ9UQMwP/cEUFRkDANzHjSh0VkdUk/AbX82uZyfyPS7cAQUEAwQCAQoMjAoAAAAAAAAC

✅ Success! Partial Transfer Transaction: https://explorer.solana.com/tx/28LZHNCQXXYqsSsxS6vzozh1eNL192umUDoBgHe4qUhZGMXN4r1wQeKcgVfHjpm65PqCTw7YbfYTXvkZKwjbwShZ?cluster=devnet
 */