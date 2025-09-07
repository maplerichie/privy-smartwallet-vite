import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface BalanceDisplayProps {
    title: string
    balance: string
    symbol: string
    icon?: string
    loading?: boolean
    className?: string
}

export function BalanceDisplay({
    title,
    balance,
    symbol,
    icon,
    loading = false,
    className
}: BalanceDisplayProps) {
    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {icon && <span className="text-2xl">{icon}</span>}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{balance}</span>
                        <Badge variant="outline">{symbol}</Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
