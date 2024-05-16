# Solana Bootcamp traing

## Info
- [Presentation](https://docs.google.com/presentation/d/1ioDlrqPk5ghKIGAHoiAjG7PoLAPQomGeVE6xQfJk2LA/edit#slide=id.p62)

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

