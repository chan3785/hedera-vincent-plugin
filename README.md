
## Vincent Signer Plugin

This plugin was built by a Gemini developer to integrate the [Vincent Platform](https://www.heyvincent.ai/) with the Hedera Agent Kit. It was built to enable AI agents to request transaction signatures from a user's Vincent Wallet, allowing for secure, policy-based transaction execution on the Hedera network without exposing private keys to the agent.

This plugin leverages Hedera's EVM compatibility and the Vincent "EVM Transaction Signer" Ability.

### Installation

```bash
npm install hedera-vincent-signer-plugin # Placeholder package name
```

### Usage

First, you need to import the `createVincentSignerPlugin` factory function and the necessary configuration types. Then, create an instance of the plugin by providing the required parameters.

```javascript
import { HederaLangchainToolkit } from 'hedera-agent-kit';
import { createVincentSignerPlugin, VincentSignerToolParams } from './plugins/vincent-signer-plugin'; // Adjust path as needed
import { ethers } from 'ethers';

// 1. Set up your delegatee signer and other params
const delegateeWallet = new ethers.Wallet('YOUR_DELEGATEE_PRIVATE_KEY');
const vincentParams: VincentSignerToolParams = {
  delegateeSigner: delegateeWallet,
  delegatorPkpEthAddress: 'USER_VINCENT_WALLET_ADDRESS', // The user's Vincent Wallet address
  hederaNetwork: 'testnet', // or 'mainnet'
};

// 2. Create the plugin instance using the factory
const vincentPlugin = createVincentSignerPlugin(vincentParams);

// 3. Add the plugin to the HederaLangchainToolkit configuration
 const hederaAgentToolkit = new HederaLangchainToolkit({
    client, // Your configured Hedera client
    configuration: {
      context: {
        mode: AgentMode.AUTONOMOUS,
      },
      plugins: [vincentPlugin], // Add the configured plugin instance
    },
  });

// The agent can now use the 'Sign and Send Transaction with Vincent' tool.
```

### Functionality

This plugin provides a single tool for securely signing and broadcasting transactions.

**Vincent Signer Plugin**
_A plugin to sign and send transactions using the Vincent platform._

| Tool Name                                       | Description                                        |Usage                                             |
| ----------------------------------------------- | -------------------------------------------------- |--------------------------------------------------------- |
| `sign_and_send_with_vincent_tool`| Signs a transaction using Vincent and broadcasts it to the Hedera network based on a user intent. | **intent (object, required):** An object describing the transaction to perform. It contains:<br/>- `action` (string, required): The type of action. Can be `transfer` or `contractCall`.<br/>- `to` (string, required): The recipient's address.<br/>- `amount` (string, optional): The amount of HBAR to transfer (for `transfer` action).<br/>- `data` (string, optional): The encoded data for a contract call (for `contractCall` action). |

