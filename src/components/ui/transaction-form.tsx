import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

interface TransactionFormProps {
    title: string
    onSubmit: (data: { to: string; amount: string }) => Promise<void>
    loading?: boolean
    buttonText?: string
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    amountLabel?: string
    amountPlaceholder?: string
    className?: string
}

export function TransactionForm({
    title,
    onSubmit,
    loading = false,
    buttonText = "Submit",
    buttonVariant = "default",
    amountLabel = "Amount",
    amountPlaceholder = "Enter amount",
    className
}: TransactionFormProps) {
    const [to, setTo] = useState("")
    const [amount, setAmount] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!to || !amount) return

        try {
            await onSubmit({ to, amount })
            setTo("")
            setAmount("")
        } catch (error) {
            console.error("Transaction failed:", error)
        }
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="to">To Address</Label>
                        <Input
                            id="to"
                            type="text"
                            placeholder="0x..."
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            disabled={loading}
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">{amountLabel}</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="any"
                            placeholder={amountPlaceholder}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant={buttonVariant}
                        disabled={loading || !to || !amount}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Processing...
                            </>
                        ) : (
                            buttonText
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
