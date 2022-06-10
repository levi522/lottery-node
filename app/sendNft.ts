import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import { web3,Wallet } from "@project-serum/anchor";
import {
    Token,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as bs58 from "bs58";


const doNFTTransfer = async function (mint: string, to: string) {
    return new Promise<any>(async (resolve, reject) => {
        let connection = new Connection(process.env.SOLANA_NETWORK!);

        const mintPublicKey = new web3.PublicKey(mint);// Mint is the Mint address found in the NFT metadata
        const destPublicKey = new web3.PublicKey(to);

        const payer = Keypair.fromSecretKey(
            bs58.decode(process.env.NFT_OWN_WALLET_SECRETKEY!)
        );

        const ownerPublicKey = payer.publicKey;


        const mintToken = new Token(
            connection,
            mintPublicKey,
            TOKEN_PROGRAM_ID,
            payer
        );

        // GET SOURCE ASSOCIATED ACCOUNT
        const associatedSourceTokenAddr = await Token.getAssociatedTokenAddress(
            mintToken.associatedProgramId,
            mintToken.programId,
            mintPublicKey,
            ownerPublicKey
        );

        // GET DESTINATION ASSOCIATED ACCOUNT
        const associatedDestinationTokenAddr = await Token.getAssociatedTokenAddress(
            mintToken.associatedProgramId,
            mintToken.programId,
            mintPublicKey,
            destPublicKey
        );

        const receiverAccount = await connection.getAccountInfo(
            associatedDestinationTokenAddr
        );

        const instructions = [];

        if (receiverAccount === null) {
            console.log("receiver account is null!");
            instructions.push(
                Token.createAssociatedTokenAccountInstruction(
                    mintToken.associatedProgramId,
                    mintToken.programId,
                    mintPublicKey,
                    associatedDestinationTokenAddr,
                    destPublicKey,
                    ownerPublicKey
                )
            );
        }

        instructions.push(
            Token.createTransferInstruction(
                TOKEN_PROGRAM_ID,
                associatedSourceTokenAddr,
                associatedDestinationTokenAddr,
                ownerPublicKey,
                [],
                1
            )
        );

        // This transaction is sending the tokens
        let transaction = new web3.Transaction();
        for (let i = 0; i < instructions.length; i++) {
            transaction.add(instructions[i]);
        }

        if (transaction) {
            let response = await connection.sendTransaction(transaction, [payer]);
            console.log("response: ", response);
            resolve(response)
        } else {
            console.log("Transaction error: transaction data is null");
            reject("Transaction error: transaction data is null")
        }
    });
};

export default doNFTTransfer;