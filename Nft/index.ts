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
import { syncNative } from "@solana/spl-token";

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

  const CollectionNftData = {
        name: "TestCollectionNFT",
        symbol: "TEST",
        description: "Test Collection NFT",
        sellerFeeBasisPoints: 100,
        imageFile: "success.png",
        isCollection: true,
        collectionAuthority: user
  };
      
  const collectionUri = await uploadMetadata(metaplex, CollectionNftData);
  const collectionNft = await createCollectionNft(metaplex, collectionUri, CollectionNftData);
    

  // upload the NFT data and get the URI for the metadata
  const uri = await uploadMetadata(metaplex, nftData);
   
  // create an NFT using helper function and the URI from the metadata
  const nft = await createNft(metaplex, uri, nftData, collectionNft.mint.address);

  const updtatedUri = await uploadMetadata(metaplex, updateNftData);
  await updateNftUri(metaplex, updtatedUri, nft.address);


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
    console.log(`*. ✅ Image URI: ${imageUri}`);

    // upload metadata and get metadata uri
    const { uri } = await metaplex
        .nfts()
        .uploadMetadata({
            name: nftData.name,
            symbol: nftData.symbol,
            description: nftData.description,
            image: imageUri,
        });
    console.log(`*. ✅ Metadata URI: ${uri}`);
    return uri
}

// -----------------------------------------------------------------
// helper function to create new NFT
async function createNft(
    metaplex: Metaplex,
    uri: string,
    nftData: NftData,
    collectionMint: PublicKey
): Promise<Nft> {

    const { nft } = await metaplex
        .nfts()
        .create({
            uri,
            name: nftData.name,
            sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
            symbol: nftData.symbol,
            collection: collectionMint,
        }, { commitment: 'finalized'});

    await metaplex.nfts().verifyCollection({
        mintAddress: nft.address,
        collectionMintAddress: collectionMint,
        isSizedCollection: true,
    });    

    console.log(`3. ✅ Created new NFT: ${nft.address.toBase58()}; https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);
    return nft;

}


// -----------------------------------------------------------------
// helper function update NFT
async function updateNftUri(
    metaplex: Metaplex,
    uri: string,
    mintAddress: PublicKey,
) {
    // fetch NFT data using mint address
    const nft = await metaplex.nfts().findByMint({ mintAddress });

    // update NFT metadata
    const { response } = await metaplex.nfts().update({
        nftOrSft: nft,
        uri: uri,
    }, { commitment: 'finalized' });
    console.log(`4.1. Token Mint https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);
    console.log(`4.2. Transaction: https://explorer.solana.com/address/${response.signature}?cluster=devnet`);
}

// -----------------------------------------------------------------
// helper function create Collectin NFT
async function createCollectionNft(
    metaplex: Metaplex,
    uri: string,
    data: CollectionNftData,
): Promise<Nft> {
    const { nft } = await metaplex.nfts().create({
        uri,
        name: data.name,
        sellerFeeBasisPoints: data.sellerFeeBasisPoints,
        symbol: data.symbol,
        isCollection: true,
        }, { commitment: 'finalized'});

    console.log(`5. ✅ Created new Collection NFT: ${nft.address.toBase58()}; https://explorer.solana.com/address/${nft.address.toBase58()}?cluster=devnet`);    

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



zip@pop-os:~/solana-training$ npx esrun ./Nft/index.ts 
Current balance is 1.878394414
0. PublicKey: B5EucqcybsSdvP2CYQzJwmKDmTLgPMWnY2Gswjv4LwNb
1. ✅ Image URI: https://arweave.net/7NafmkQRLutE3JML6zTvVlyi6QhpT6mYTbLxDbHzRnA
2. ✅ Metadata URI: https://arweave.net/OF3gottG6rMZ_lA7muh1OP1AoeYBh7Gsr7HUlPxH-Ro
3. ✅ Created new NFT: 3V1xqmRKfsKvErxXe44WgXYc7Laxu1CXs1XmpHHKbek9; https://explorer.solana.com/address/3V1xqmRKfsKvErxXe44WgXYc7Laxu1CXs1XmpHHKbek9?cluster=devnet
1. ✅ Image URI: https://arweave.net/RO-s3qR0V41t4SC62LnDC9EPtD2_kcnsuDt_3m3oXUg
2. ✅ Metadata URI: https://arweave.net/kU2ua6ri7grs84MYw2NX1-VNBlsRP9kE-9s5K-Lenvw
4.1. Token Mint https://explorer.solana.com/address/3V1xqmRKfsKvErxXe44WgXYc7Laxu1CXs1XmpHHKbek9?cluster=devnet
4.2. Transaction: https://explorer.solana.com/address/3khQDsB6JQShymnzTXXLL3kLLdXn3VfdtKauchVEm7JUQNhbSrJGCDWquraSYRBqgKK3CgiP5zCagdjGCcESS9qp?cluster=devnet
Finished successfully

   * 
   */