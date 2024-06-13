import { initializeKeypair } from "./initializeKeypair"
import { Connection, clusterApiUrl, PublicKey, Signer } from "@solana/web3.js"
import {
  Metaplex,
  keypairIdentity,
  irysStorage,
  toMetaplexFile,
  NftWithToken,
  Nft
} from "@metaplex-foundation/js"
import * as fs from "fs"

const PATH = "Nft/";

interface NftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
}

interface CollectionNftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
  isCollection: boolean
  collectionAuthority: Signer
}

// example data for a new NFT
const nftData = {
  name: "Name",
  symbol: "SYMBOL",
  description: "Description",
  sellerFeeBasisPoints: 0,
  imageFile: "solana.png",
}

// example data for updating an existing NFT
const updateNftData = {
  name: "Update",
  symbol: "UPDATE",
  description: "Update Description",
  sellerFeeBasisPoints: 100,
  imageFile: "success.png",
}

async function main() {
  // create a new connection to the cluster's API
  const connection = new Connection(clusterApiUrl("devnet"))

  // initialize a keypair for the user
  const user = await initializeKeypair(connection)
  console.log("0. PublicKey:", user.publicKey.toBase58());

  // metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      irysStorage({
        address: "https://devnet.bundlr.network",
        timeout: 60000,
        providerUrl: "https://api.devnet.solana.com",
      })
    )

   // upload the NFT data and get the URI for the metadata
   const uri = await uploadMetadata(metaplex, nftData);
   
   // create an NFT using helper function and the URI from the metadata
   const nft = await createNft(metaplex, uri, nftData);
}

// -----------------------------------------------------------------
// helper function to upload image and metadata
async function uploadMetadata(
    metaplex: Metaplex,
    nftData: NftData,
): Promise<string> {
    // file to buffer
    const buffer = fs.readFileSync(PATH + nftData.imageFile);

    // buffer to metaplex file
    const file = toMetaplexFile(buffer, nftData.imageFile);

    // upload image and get image uri
    const imageUri = await metaplex.storage().upload(file);
    console.log(`1. ✅ Image URI: ${imageUri}`);

    // upload metadata and get metadata uri
    const { uri } = await metaplex
        .nfts()
        .uploadMetadata({
            name: nftData.name,
            symbol: nftData.symbol,
            description: nftData.description,
            image: imageUri,
        });
    console.log(`2. ✅ Metadata URI: ${uri}`);
    return uri
}

// -----------------------------------------------------------------
// helper function to create new NFT
async function createNft(
    metaplex: Metaplex,
    uri: string,
    nftData: NftData,
): Promise<Nft> {

    const { nft } = await metaplex
        .nfts()
        .create({
            uri,
            name: nftData.name,
            sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
            symbol: nftData.symbol,
        }, { commitment: 'finalized'});

    console.log(`3. ✅ Created new NFT: ${nft.address.toBase58()}; https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);
    return nft;

}
// ==================================================================

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })




  /**
   * Result of execution:
   * zip@pop-os:~/solana-training$ npx esrun ./Nft/index.ts 
Current balance is 1.9228136
0. PublicKey: B5EucqcybsSdvP2CYQzJwmKDmTLgPMWnY2Gswjv4LwNb
1. ✅ Image URI: https://arweave.net/YhESbERoHmW9ZZyh4Ik9kQvZpRjGpN6FofxaEqZ0DJ0
2. ✅ Metadata URI: https://arweave.net/idC1If0W2a_IYf8t9YYz7PEtcVzK2r4TBVXxO6fZm-0
3. ✅ Created new NFT: GQm2pDg3fSPauUfqAGhRoR1Huh3SvAautYi3sHnzfkUT; https://explorer.solana.com/address/GQm2pDg3fSPauUfqAGhRoR1Huh3SvAautYi3sHnzfkUT?cluster=devnet
Finished successfully
   * 
   */