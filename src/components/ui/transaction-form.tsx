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
    // Controlled component props
    toValue?: string
    amountValue?: string
    onToChange?: (value: string) => void
    onAmountChange?: (value: string) => void
}

export function TransactionForm({
    title,
    onSubmit,
    loading = false,
    buttonText = "Submit",
    buttonVariant = "default",
    amountLabel = "Amount",
    amountPlaceholder = "Enter amount",
    className,
    toValue,
    amountValue,
    onToChange,
    onAmountChange
}: TransactionFormProps) {
    // Use internal state as fallback if not controlled
    const [internalTo, setInternalTo] = useState("")
    const [internalAmount, setInternalAmount] = useState("")

    // Use controlled values if provided, otherwise use internal state
    const to = toValue !== undefined ? toValue : internalTo
    const amount = amountValue !== undefined ? amountValue : internalAmount

    const handleToChange = (value: string) => {
        if (onToChange) {
            onToChange(value)
        } else {
            setInternalTo(value)
        }
    }

    const handleAmountChange = (value: string) => {
        if (onAmountChange) {
            onAmountChange(value)
        } else {
            setInternalAmount(value)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!to || !amount) return

        try {
            await onSubmit({ to, amount })
            // Don't reset automatically - let parent component handle it
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
                            onChange={(e) => handleToChange(e.target.value)}
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
                            onChange={(e) => handleAmountChange(e.target.value)}
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
