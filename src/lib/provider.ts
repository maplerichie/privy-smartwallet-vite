// import { createPublicClient, createWalletClient, custom, http, type Hex } from 'viem';
import { createPublicClient, http } from 'viem';
// import { useWallets } from '@privy-io/react-auth';
import { polygonAmoy } from 'viem/chains';

// const { wallets } = useWallets();
// const wallet = wallets[0]; // Replace this with your desired wallet
// await wallet.switchChain(polygonAmoy.id);

// const provider = await wallet.getEthereumProvider();
// const walletClient = createWalletClient({
//     account: wallet.address as Hex,
//     chain: polygonAmoy,
//     transport: custom(provider),
// });
export const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http()
});