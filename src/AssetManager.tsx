import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartWallets } from '@privy-io/react-auth/smart-wallets';
import { formatEther, parseEther, formatUnits, parseUnits, encodeFunctionData } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddressDisplay } from '@/components/ui/address-display';
import { BalanceDisplay } from '@/components/ui/balance-display';
import { TransactionForm } from '@/components/ui/transaction-form';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { publicClient } from './lib/provider';


// Contract addresses
const FLY_ERC20 = "0x0A572a0aAAf39a201666dCE27328CE17bBCd8e28";
const CBR_ERC721 = "0x2045a812A1AA47e012231bB82fB8079490885578";

// ERC20 ABI
const ERC20_ABI = [
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "to", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

// ERC721 ABI
const ERC721_ABI = [
    {
        "inputs": [{ "name": "owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "index", "type": "uint256" }],
        "name": "ownerOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "to", "type": "address" }],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }],
        "name": "approve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

interface AssetManagerProps { }

const AssetManager: React.FC<AssetManagerProps> = () => {
    const { user } = usePrivy();
    const { client } = useSmartWallets();

    // State for balances and data
    const [nativeBalance, setNativeBalance] = useState<string>('0');
    const [flyBalance, setFlyBalance] = useState<string>('0');
    const [ownedTokens, setOwnedTokens] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [transferTo, setTransferTo] = useState('');
    const [transferValue, setTransferValue] = useState('');
    const [mintTo, setMintTo] = useState('');
    const [mintValue, setMintValue] = useState('');
    const [approveTo, setApproveTo] = useState('');
    const [approveValue, setApproveValue] = useState('');
    const [transferTokenId, setTransferTokenId] = useState('');
    const [transferTokenTo, setTransferTokenTo] = useState('');
    const [approveTokenTo, setApproveTokenTo] = useState('');
    const [approveTokenId, setApproveTokenId] = useState('');

    // Transaction state management
    const [transactionState, setTransactionState] = useState<{
        status: 'idle' | 'pending' | 'success' | 'error';
        hash?: string;
        error?: string;
        message?: string;
    }>({ status: 'idle' });

    // Get smart wallet address
    const smartWallet = user?.linkedAccounts.find((account) => account.type === 'smart_wallet');
    const walletAddress = smartWallet?.address;

    // Fetch balances and data
    const fetchData = async () => {
        if (!client || !walletAddress) return;

        setLoading(true);
        try {
            // Get native balance
            const balance = await publicClient.getBalance({ address: walletAddress as `0x${string}` });
            setNativeBalance(formatEther(balance));

            // Get FLY ERC20 balance
            const flyBalanceResult = await publicClient.readContract({
                address: FLY_ERC20 as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [walletAddress as `0x${string}`]
            });
            setFlyBalance(formatUnits(flyBalanceResult, 18));

            // Get owned ERC721 tokens
            const tokenBalance = await publicClient.readContract({
                address: CBR_ERC721 as `0x${string}`,
                abi: ERC721_ABI,
                functionName: 'balanceOf',
                args: [walletAddress as `0x${string}`]
            });

            const tokens: number[] = [];
            for (let i = 0; i < Number(tokenBalance); i++) {
                // const tokenId = await publicClient.readContract({
                //     address: CBR_ERC721 as `0x${string}`,
                //     abi: ERC721_ABI,
                //     functionName: 'ownerOf',
                //     args: [BigInt(i)]
                // });
                // tokens.push(Number(tokenId));
                tokens.push(i);
            }
            setOwnedTokens(tokens);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (client && walletAddress) {
            fetchData();
        }
    }, [client, walletAddress]);

    // Helper function to execute transactions with state management
    const executeTransaction = async (
        transactionFn: () => Promise<string>,
        successMessage: string
    ) => {
        setTransactionState({ status: 'pending', message: 'Processing transaction...' });

        try {
            const txHash = await transactionFn();
            setTransactionState({
                status: 'success',
                hash: txHash,
                message: successMessage
            });
            // Refresh data after successful transaction
            await fetchData();
        } catch (error) {
            console.error('Transaction error:', error);
            setTransactionState({
                status: 'error',
                error: error instanceof Error ? error.message : 'Transaction failed'
            });
        }
    };

    // Helper function to reset transaction state
    const resetTransactionState = () => {
        setTransactionState({ status: 'idle' });
    };

    // Native token transfer
    const handleNativeTransfer = async () => {
        if (!client || !transferTo || !transferValue) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    showWalletUIs: true, // Privy UI will be shown
                    title: 'Transfer POL',
                    description: `Transfer ${transferValue} POL to ${transferTo}`,
                    buttonText: 'Transfer'
                };
                return await client.sendTransaction({
                    to: transferTo as `0x${string}`,
                    value: parseEther(transferValue)
                }, { uiOptions });
            },
            `Successfully transferred ${transferValue} POL to ${transferTo}`
        );
    };

    // FLY ERC20 transfer
    const handleFlyTransfer = async () => {
        if (!client || !transferTo || !transferValue) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    title: 'Transfer FLY',
                    description: `Transfer ${transferValue} FLY to ${transferTo}`,
                    buttonText: 'Transfer'
                };
                return await client.sendTransaction({
                    to: FLY_ERC20 as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'transfer',
                        args: [transferTo as `0x${string}`, parseUnits(transferValue, 18)]
                    })
                }, { uiOptions });
            },
            `Successfully transferred ${transferValue} FLY to ${transferTo}`
        );
    };

    // FLY ERC20 mint
    const handleFlyMint = async () => {
        if (!client || !mintTo || !mintValue) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    title: 'Mint FLY',
                    description: `Mint ${mintValue} FLY to ${mintTo}`,
                    buttonText: 'Mint'
                };
                return await client.sendTransaction({
                    to: FLY_ERC20 as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'mint',
                        args: [mintTo as `0x${string}`, parseUnits(mintValue, 18)]
                    })
                }, { uiOptions });
            },
            `Successfully minted ${mintValue} FLY to ${mintTo}`
        );
    };

    // FLY ERC20 approve
    const handleFlyApprove = async () => {
        if (!client || !approveTo || !approveValue) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    title: 'Approve FLY',
                    description: `Approve ${approveValue} FLY to ${approveTo}`,
                    buttonText: 'Approve'
                };
                return await client.sendTransaction({
                    to: FLY_ERC20 as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [approveTo as `0x${string}`, parseUnits(approveValue, 18)]
                    })
                }, { uiOptions });
            },
            `Successfully approved ${approveValue} FLY to ${approveTo}`
        );
    };

    // CBR ERC721 transfer
    const handleTokenTransfer = async () => {
        if (!client || !transferTokenTo || !transferTokenId) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    title: 'Transfer Token',
                    description: `Transfer token #${transferTokenId} to ${transferTokenTo}`,
                    buttonText: 'Transfer'
                };
                return await client.sendTransaction({
                    to: CBR_ERC721 as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC721_ABI,
                        functionName: 'safeTransferFrom',
                        args: [walletAddress as `0x${string}`, transferTokenTo as `0x${string}`, BigInt(transferTokenId)]
                    })
                }, { uiOptions });
            },
            `Successfully transferred token #${transferTokenId} to ${transferTokenTo}`
        );
    };

    // CBR ERC721 mint
    const handleTokenMint = async () => {
        if (!client || !mintTo) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    title: 'Mint Token',
                    description: `Mint token to ${mintTo}`,
                    buttonText: 'Mint'
                };
                return await client.sendTransaction({
                    to: CBR_ERC721 as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC721_ABI,
                        functionName: 'safeMint',
                        args: [mintTo as `0x${string}`]
                    })
                }, { uiOptions });
            },
            `Successfully minted token to ${mintTo}`
        );
    };

    // CBR ERC721 approve
    const handleTokenApprove = async () => {
        if (!client || !approveTokenTo || !approveTokenId) return;

        await executeTransaction(
            async () => {
                const uiOptions = {
                    title: 'Approve Token',
                    description: `Approve token #${approveTokenId} to ${approveTokenTo}`,
                    buttonText: 'Approve'
                };
                return await client.sendTransaction({
                    to: CBR_ERC721 as `0x${string}`,
                    data: encodeFunctionData({
                        abi: ERC721_ABI,
                        functionName: 'approve',
                        args: [approveTokenTo as `0x${string}`, BigInt(approveTokenId)]
                    })
                }, { uiOptions });
            },
            `Successfully approved token #${approveTokenId} to ${approveTokenTo}`
        );
    };

    if (!walletAddress) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                        <div className="text-4xl">⚠️</div>
                        <p className="text-muted-foreground">Please connect your smart wallet first</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💼</span>
                    Asset Manager
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Network: Polygon Amoy</span>
                    <Separator orientation="vertical" className="h-4" />
                    <AddressDisplay address={walletAddress} />
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Skeleton className="h-32" />
                            <Skeleton className="h-32" />
                            <Skeleton className="h-32" />
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="native">Native Token</TabsTrigger>
                            <TabsTrigger value="erc20">FLY Token</TabsTrigger>
                            <TabsTrigger value="erc721">CBR NFTs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <BalanceDisplay
                                    title="Native Token"
                                    balance={nativeBalance}
                                    symbol="POL"
                                    icon="🪙"
                                    loading={loading}
                                />
                                <BalanceDisplay
                                    title="FLY Token"
                                    balance={flyBalance}
                                    symbol="FLY"
                                    icon="🪙"
                                    loading={loading}
                                />
                                <BalanceDisplay
                                    title="CBR NFTs"
                                    balance={ownedTokens.length.toString()}
                                    symbol="tokens"
                                    icon="🎨"
                                    loading={loading}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contract Addresses</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">FLY ERC20:</span>
                                        <AddressDisplay address={FLY_ERC20} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">CBR ERC721:</span>
                                        <AddressDisplay address={CBR_ERC721} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="native" className="space-y-6">
                            <BalanceDisplay
                                title="Native Token (POL)"
                                balance={nativeBalance}
                                symbol="POL"
                                icon="🪙"
                                loading={loading}
                            />

                            <TransactionForm
                                title="Transfer POL"
                                onSubmit={async ({ to, amount }) => {
                                    setTransferTo(to);
                                    setTransferValue(amount);
                                    await handleNativeTransfer();
                                }}
                                loading={loading}
                                buttonText="Transfer POL"
                                buttonVariant="default"
                                amountLabel="Amount (POL)"
                                amountPlaceholder="Enter POL amount"
                            />
                        </TabsContent>

                        <TabsContent value="erc20" className="space-y-6">
                            <BalanceDisplay
                                title="FLY ERC20 Token"
                                balance={flyBalance}
                                symbol="FLY"
                                icon="🪙"
                                loading={loading}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <TransactionForm
                                    title="Transfer FLY"
                                    onSubmit={async ({ to, amount }) => {
                                        setTransferTo(to);
                                        setTransferValue(amount);
                                        await handleFlyTransfer();
                                    }}
                                    loading={loading}
                                    buttonText="Transfer FLY"
                                    buttonVariant="default"
                                    amountLabel="Amount (FLY)"
                                    amountPlaceholder="Enter FLY amount"
                                />

                                <TransactionForm
                                    title="Mint FLY"
                                    onSubmit={async ({ to, amount }) => {
                                        setMintTo(to);
                                        setMintValue(amount);
                                        await handleFlyMint();
                                    }}
                                    loading={loading}
                                    buttonText="Mint FLY"
                                    buttonVariant="secondary"
                                    amountLabel="Amount (FLY)"
                                    amountPlaceholder="Enter FLY amount"
                                />

                                <TransactionForm
                                    title="Approve FLY"
                                    onSubmit={async ({ to, amount }) => {
                                        setApproveTo(to);
                                        setApproveValue(amount);
                                        await handleFlyApprove();
                                    }}
                                    loading={loading}
                                    buttonText="Approve FLY"
                                    buttonVariant="outline"
                                    amountLabel="Amount (FLY)"
                                    amountPlaceholder="Enter FLY amount"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="erc721" className="space-y-6">
                            <BalanceDisplay
                                title="CBR ERC721 NFTs"
                                balance={ownedTokens.length.toString()}
                                symbol="tokens"
                                icon="🎨"
                                loading={loading}
                            />

                            {ownedTokens.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Owned Tokens</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                            {ownedTokens.map((tokenId) => (
                                                <div
                                                    key={tokenId}
                                                    className="flex flex-col items-center p-3 border rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                                >
                                                    <div className="text-2xl mb-1">🎨</div>
                                                    <Badge variant="outline" className="text-xs">
                                                        #{tokenId}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Transfer Token</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="transferTokenTo">To Address</Label>
                                            <Input
                                                id="transferTokenTo"
                                                type="text"
                                                placeholder="0x..."
                                                value={transferTokenTo}
                                                onChange={(e) => setTransferTokenTo(e.target.value)}
                                                className="font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="transferTokenId">Token ID</Label>
                                            <Input
                                                id="transferTokenId"
                                                type="number"
                                                placeholder="Token ID"
                                                value={transferTokenId}
                                                onChange={(e) => setTransferTokenId(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleTokenTransfer}
                                            disabled={!transferTokenTo || !transferTokenId}
                                            className="w-full"
                                        >
                                            Transfer Token
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Mint Token</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="mintTokenTo">To Address</Label>
                                            <Input
                                                id="mintTokenTo"
                                                type="text"
                                                placeholder="0x..."
                                                value={mintTo}
                                                onChange={(e) => setMintTo(e.target.value)}
                                                className="font-mono"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleTokenMint}
                                            disabled={!mintTo}
                                            variant="secondary"
                                            className="w-full"
                                        >
                                            Mint Token
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Approve Token</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="approveTokenTo">To Address</Label>
                                            <Input
                                                id="approveTokenTo"
                                                type="text"
                                                placeholder="0x..."
                                                value={approveTokenTo}
                                                onChange={(e) => setApproveTokenTo(e.target.value)}
                                                className="font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="approveTokenId">Token ID</Label>
                                            <Input
                                                id="approveTokenId"
                                                type="number"
                                                placeholder="Token ID"
                                                value={approveTokenId}
                                                onChange={(e) => setApproveTokenId(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleTokenApprove}
                                            disabled={!approveTokenTo || !approveTokenId}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Approve Token
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>

            {/* Transaction State Modals */}

            {/* Pending Transaction Modal */}
            <AlertDialog open={transactionState.status === 'pending'}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {transactionState.message || 'Please wait while your transaction is being processed...'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

            {/* Success Transaction Modal */}
            <AlertDialog open={transactionState.status === 'success'}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                            <span className="text-2xl">✅</span>
                            Successful
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {transactionState.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {transactionState.hash && (
                        <div className="space-y-2">
                            <Button
                                variant="link"
                                size="sm"
                                className="w-full overflow-hidden whitespace-nowrap text-ellipsis"
                                onClick={() => window.open(`https://amoy.polygonscan.com/tx/${transactionState.hash}`, '_blank')}
                            >
                                {transactionState.hash}
                            </Button>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <Button onClick={resetTransactionState} className="w-full">
                            Close
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Error Transaction Modal */}
            <AlertDialog open={transactionState.status === 'error'}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <span className="text-2xl">❌</span>
                            Failed
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {transactionState.error || 'An error occurred while processing your transaction.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={resetTransactionState} className="w-full">
                            Close
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default AssetManager;
