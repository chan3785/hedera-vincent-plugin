
import { Plugin } from '@/shared/plugin';
import { Context } from '@/shared/configuration';
import createVincentTool, { SIGN_AND_SEND_WITH_VINCENT_TOOL, VincentSignerToolParams } from './tools/vincent/sign-and-send-with-vincent';

// Re-export the params interface so users can import it from the plugin
export { VincentSignerToolParams };

// Export the constant for the tool name
export const vincentSignerToolNames = {
  SIGN_AND_SEND_WITH_VINCENT_TOOL,
} as const;

/**
 * Factory function to create the VincentSignerPlugin.
 * This plugin requires runtime configuration.
 * 
 * @param params - The configuration parameters required for the Vincent tool.
 * @returns A Plugin object configured with the Vincent signer tool.
 */
export const createVincentSignerPlugin = (params: VincentSignerToolParams): Plugin => ({
  name: 'vincent-signer-plugin',
  version: '1.0.0',
  description: 'A plugin to sign and send transactions using the Vincent platform.',
  tools: (_context: Context) => [
    createVincentTool(params), // Pass the runtime configuration to the tool factory
  ],
});

export default createVincentSignerPlugin;
