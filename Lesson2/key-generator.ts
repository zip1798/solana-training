import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import logUpdate from 'log-update';
import { randomBytes } from 'crypto'
import base58 from "bs58";
import { Keypair } from "@solana/web3.js";

const argv = yargs(hideBin(process.argv)).argv;
if (!argv['starts'] && !argv['ends']) {
    throw new Error('Have to set stars or ends parameter');
}


const frames = ['-', '\\', '|', '/'];
let startAt = Math.floor((new Date()).getTime() / 1000);
const result: Keypair[] = [];

setInterval(() => {
    const interval = Math.floor((new Date()).getTime() / 1000) - startAt;
    let seconds = String(interval % 60);
    let minutes = String(Math.floor((interval % 3600) / 60));
    let hours = String(Math.floor(interval / 3600));
    if (seconds.length < 2) seconds = '0' + seconds;
    if (minutes.length < 2) minutes = '0' + minutes;
    const frame = frames[interval % frames.length];

    const keypair = generateKeyPair();
    if (checkKeyPair(keypair, argv['starts'], argv['ends'])) {
        result.push(keypair);    
    }

    logUpdate(`${frame} ${hours}:${minutes}:${seconds} \n${getResultString(result)}`);
}, 1);

function generateKeyPair(): Keypair {
    const rb = randomBytes(32);
    return Keypair.fromSeed(rb);
}

function getResultString(result: Keypair[]): string {
    let str = '';
    result.forEach( keypair => {
        str = str + `[${keypair.publicKey.toBase58()}, ${base58.encode(keypair.secretKey) }] \n`;
    })
    return str;
}

function checkKeyPair(keypair: Keypair, starts: string, ends: string): boolean {
    const publicKey = keypair.publicKey.toBase58().toLowerCase();
    let result = false;

    String(starts).split(',').forEach(s => {
        if (publicKey.startsWith(s)) {
            result = true;
        }
    })
    
    String(ends).split(',').forEach(s => {
        if (publicKey.endsWith(s)) {
            result = true;
        }
    })
    
    return result;
}