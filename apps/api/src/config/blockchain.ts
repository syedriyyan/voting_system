export const config = {
  networkRpcUrl: process.env.NETWORK_RPC_URL || 'http://localhost:8545',
  chainId: parseInt(process.env.CHAIN_ID || '31337'),
  privateKey: process.env.PRIVATE_KEY,
  votingSystemAddress: process.env.VOTING_SYSTEM_ADDRESS,
  voterRegistryAddress: process.env.VOTER_REGISTRY_ADDRESS,
};