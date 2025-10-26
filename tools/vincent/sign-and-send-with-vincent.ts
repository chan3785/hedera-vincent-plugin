
import { Account, getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk';
import { ethers } from 'ethers';
import { z } from 'zod';
import { Tool } from '@/plugins/vincent-signer-plugin/shared/tools';
import { Client } from '@hashgraph/sdk';
import { Context } from '../../shared/configuration';

// Define the parameters needed for configuration
export interface VincentSignerToolParams {
  delegateeSigner: ethers.Signer;
  delegatorPkpEthAddress: string;
  hederaNetwork: 'mainnet' | 'testnet';
}

// Define the Zod schema for the tool's input parameters
const signAndSendParameters = z.object({
  intent: z.object({
    action: z.enum(['transfer', 'contractCall']),
    to: z.string().describe("The recipient's address."),
    amount: z.string().optional().describe('The amount of HBAR to transfer for a "transfer" action.'),
    data: z.string().optional().describe('The data for a "contractCall" action.'),
  }).describe('The transaction intent object.'),
});

// The actual execution logic
async function executeTransaction(config: VincentSignerToolParams, toolParams: z.infer<typeof signAndSendParameters>): Promise<any> {
  const { delegateeSigner, delegatorPkpEthAddress, hederaNetwork } = config;
  const { intent } = toolParams;

  const hederaJsonRpcUrl = hederaNetwork === 'mainnet' ? 'https://mainnet.hashio.io/api' : 'https://testnet.hashio.io/api';
  const hederaChainId = hederaNetwork === 'mainnet' ? 295 : 296;

  try {
    const provider = new ethers.JsonRpcProvider(hederaJsonRpcUrl);
    const feeData = await provider.getFeeData();
    const nonce = await provider.getTransactionCount(delegatorPkpEthAddress);

    let unsignedTx: ethers.TransactionLike;

    if (intent.action === 'transfer') {
      unsignedTx = {
        to: intent.to,
        value: ethers.parseEther(intent.amount || '0'),
        chainId: hederaChainId,
        gasPrice: feeData.gasPrice,
        gasLimit: 21000,
        nonce: nonce,
      };
    } else if (intent.action === 'contractCall') {
      unsignedTx = {
        to: intent.to,
        data: intent.data,
        chainId: hederaChainId,
        gasPrice: feeData.gasPrice,
        gasLimit: 300000,
        nonce: nonce,
      };
    } else {
      return { result: 'Error: Invalid transaction action.' };
    }

    const serializedTransaction = ethers.Transaction.from(unsignedTx).unsignedSerialized;

    const vincentClient = await getVincentAbilityClient({
      delegatee: delegateeSigner as Account,
    });

    const executeResult = await vincentClient.execute({
      ability: 'evm-transaction-signer',
      parameters: {
        serializedTransaction: serializedTransaction,
      },
      options: {
        delegatorPkpEthAddress: delegatorPkpEthAddress,
      },
    });

    if (!executeResult.result) {
      throw new Error('Failed to get signed transaction from Vincent.');
    }

    const signedTransaction = (executeResult.result as any).signedTransaction;
    const txResponse = await provider.broadcastTransaction(signedTransaction);
    await txResponse.wait();

    return {
      result: `Transaction successful with hash: ${txResponse.hash}`,
      transactionHash: txResponse.hash,
    };
  } catch (error: any) {
    console.error('[VincentSignerTool] Error:', error);
    return {
      result: `Error: ${error.message}`,
    };
  }
}

export const SIGN_AND_SEND_WITH_VINCENT_TOOL = 'sign_and_send_with_vincent_tool';

// Tool factory function
const tool = (config: VincentSignerToolParams): Tool => ({
  method: SIGN_AND_SEND_WITH_VINCENT_TOOL,
  name: 'Sign and Send Transaction with Vincent',
  description: 'Signs a transaction using Vincent and broadcasts it to the Hedera network based on a user intent.',
  parameters: signAndSendParameters,
  execute: (_client: Client, _context: Context, toolParams: any) => {
    return executeTransaction(config, toolParams);
  },
});

export default tool;
