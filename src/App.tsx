import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AddressDisplay } from '@/components/ui/address-display';
import { ThemeToggle } from '@/components/theme-toggle';
import AssetManager from './AssetManager';

function App() {
  const { ready, login, authenticated, user, logout, getAccessToken } = usePrivy();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setAccessToken(await getAccessToken());
    };
    fetchData();
  }, [authenticated])

  const smartWallet = user?.linkedAccounts.find((account) => account.type === 'smart_wallet');

  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-center space-y-4 flex-1">
              <h1 className="text-4xl font-bold tracking-tight">Privy Smart Wallet Demo</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>

          {ready ? (
            <>
              {authenticated ? (
                <div className="space-y-8">
                  {/* User Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Wallet Address</h3>
                          {user?.wallet?.address ? (
                            <AddressDisplay address={user.wallet.address} showFull />
                          ) : (
                            <Badge variant="outline">No wallet</Badge>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Smart Wallet Address</h3>
                          {smartWallet?.address ? (
                            <AddressDisplay address={smartWallet.address} showFull />
                          ) : (
                            <Badge variant="outline">No smart wallet</Badge>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">User ID</h3>
                          <Badge variant="secondary">{user?.id || 'N/A'}</Badge>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">User Data</h3>
                          <Textarea
                            value={JSON.stringify(user, null, 2) || ''}
                            rows={8}
                            readOnly
                            className="font-mono text-sm"
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Access Token</h3>
                          <Textarea
                            value={accessToken || ''}
                            rows={3}
                            readOnly
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asset Manager */}
                  <AssetManager />

                  {/* Logout Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => logout()}
                      variant="destructive"
                      size="lg"
                      className="px-8"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-6 py-12">
                  <Button
                    onClick={() => login()}
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    Connect Wallet
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">Initializing...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
