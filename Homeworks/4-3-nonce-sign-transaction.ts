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
import { 
  Connection, 
  PublicKey, 
  clusterApiUrl, 
  Transaction, 
  Keypair,
  SystemProgram,
  NonceAccount,
  NONCE_ACCOUNT_LENGTH 
} from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);
const TRANSFER_AMOUNT = 2700;

const sender = getKeypairFromEnvironment("SECRET_KEY");
const recipient = getKeypairFromEnvironment("SECRET_KEY2");
const nonceKeypair = getKeypairFromEnvironment("NONCE_ACCOUNT_KEY");

const mintPublicKey = new PublicKey(
  "gxqs2jApgRZRaJYYbboqFFvwvXAyMb9oicutbKku5CB"
);

// Create Nonce Account 
// await createNonceAccount(sender, sender, nonceKeypair);
// Nonce Account: EStBo8to5fVr76qqYaegcVp2AQXVqb9LtnKwrVz7brpV
// Create Nonce Account Transaction: https://explorer.solana.com/tx/4LfxN1shAtzpej3vNnnNfhcmBAjYEvbiVi9EYsycQzgRLxYz3nngzga7buLUSUUcWPHq3ii8Rcn8cuGsbJDaCzZx?cluster=devnet


// Get Nonce Account 
const nonceAccount = await getNonceAccount(nonceKeypair.publicKey);
console.log('Nonce Account: ', nonceKeypair.publicKey.toBase58());
console.log('Nonce: ', nonceAccount.nonce);


//*
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


const transaction = new Transaction({
    recentBlockhash: nonceAccount.nonce,
    feePayer: recipient.publicKey, // Recipient pays the transaction fee
});

transaction.add(
    SystemProgram.nonceAdvance({
        noncePubkey: nonceKeypair.publicKey,
        authorizedPubkey: sender.publicKey,
    }),
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

//*/

/**
 * Result of execution:
 * 
Nonce Account:  EStBo8to5fVr76qqYaegcVp2AQXVqb9LtnKwrVz7brpV
Nonce:  6STd7ZR8FbQj4Eg4PbLQfDVEMHt5nK6dzHBKWL5rHeos
✅ Success! Mint Transaction: https://explorer.solana.com/tx/3SAvGERa8L3tLozVuGiTPoPYm5QxkyNAMoTpa8uHQhvfZHz2RbkEA1nK1aneZyoSMnDZidTUDqam3Y4s9jaAZs2J?cluster=devnet

Partial Sign Transaction: AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACcv3ZObeqbeE8DrcgjruvhTc7mE4DZZQUHIFQYtuVinsx85S8soATQYdSK/zbcEhVlstLS7VMt3Lv+1Hcg8kkEAgEECUJW9FCMQtXOkTSaKnQtmNTZLQugVpDAlDGczTtFdZfjlarq3HzI5d2HNkKkLo03+bp0X95vTttLFlFoBkiDvkSBoiAKiIM3udFTe1PuzQBrQ8KaUS+HzvMHpsdpkwrxGItTLEwIrQ/L/cXdoERbpsWLBcyYvMFpWWYsCnOIziFVx8lTnKx6W09DNEKiyo1pTKqfMOW4MjrCljrPZGOWnnYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAo8yvZwFTz0X1qOR3JhCAo8aNU8GxDdDeOOoBeE9oAoBqfVFxksVo7gioRfc9KXiM8DXDFFshqzRNgGLqlAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqVDQDqLjGIfHrTrEOpSBt9WaNLZODFJiBu5aoBNRt08iAgUDBAcBBAQAAAAIBAMGAgEKDIwKAAAAAAAAAg==

✅ Success! Partial Transfer Transaction: https://explorer.solana.com/tx/4GqozDERnMGiHqbhGABJLXbMNZkSF3cMdw83hRttjtJq5ivfU1542u86LQKQjvaY7URjNLid7jSxHXMZkLA7VVRF?cluster=devnet
 */

async function createNonceAccount(payer: Keypair, auth: Keypair, nonceAccount: Keypair ) {
    let tx = new Transaction();
    tx.add(
        // create nonce account
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: nonceAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH),
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,
        }),
        // init nonce account
        SystemProgram.nonceInitialize({
            noncePubkey: nonceAccount.publicKey, // nonce account pubkey
            authorizedPubkey: auth.publicKey, // nonce account auth
        })
    );
    tx.feePayer = payer.publicKey;
    const signature = await connection.sendTransaction(tx, [nonceAccount, payer])
    const link = getExplorerLink("transaction", signature, "devnet");

    console.log(`Nonce Account: ${nonceAccount.publicKey.toBase58()}`);
    console.log(`Create Nonce Account Transaction: ${link}`)
}


async function getNonceAccount(nonceAccountPubkey: PublicKey) { 
    const accountInfo = await connection.getAccountInfo(nonceAccountPubkey);

    if (accountInfo === null) {
        throw new Error(`Unable to find nonce account: ${nonceAccountPubkey}`);
    }

    return  NonceAccount.fromAccountData(accountInfo.data);
}