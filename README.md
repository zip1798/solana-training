# Solana Bootcamp traing

## Info
- [Presentation](https://docs.google.com/presentation/d/1ioDlrqPk5ghKIGAHoiAjG7PoLAPQomGeVE6xQfJk2LA/edit#slide=id.p62)
- [Solana SPL Documentation](https://solana-labs.github.io/solana-program-library/token/js/index.html)
- [Example Partial Sign Transaction in solanacookbook](https://solanacookbook.com/references/offline-transactions.html#partial-sign-transaction)
- [Second example](https://blogs.shyft.to/how-to-sign-transactions-on-solana-aa73513c8cd2)

Install
```
npm ci
```

## Lesson 1 - Generate Keypair
```
npx esrun generate-keypair.ts
```

## Lesson 2 - Connenct ot devnet and check balance
```
npx esrun ./Lesson2/check-balance.ts
```

#### Generate keypair with predefined simbols
```
npx esrun ./Lesson2/key-generator.ts --starts=zip
``` 

## Lesson 3 - Send sol
```
npx esrun ./Lesson3/send-sol.ts
```

## Lesson 4 - SPL tokens

Create mint authority
```
npx esrun ./Lesson4/create-token-mint.ts
```

Create token account
```
npx esrun ./Lesson4/create-token-account.ts
```

Mint some tokens for token account
```
npx esrun ./Lesson4/mint-tokens.ts
```

#### Homework
Create mulisig authority for token mint
```
npx esrun ./Homework/4-1-multisig-mint-tokens.ts
```


Partial sign of transaction
```
npx esrun ./Homework/4-2-partial-sign-transaction.ts
```

Partial sign of transaction with durable nonce
```
npx esrun ./Homework/4-3-nonce-sign-transaction.ts
```



