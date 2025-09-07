import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AddressDisplayProps {
    address: string
    className?: string
    showFull?: boolean
}

export function AddressDisplay({ address, className, showFull = false }: AddressDisplayProps) {
    const displayAddress = showFull
        ? address
        : `${address.slice(0, 6)}...${address.slice(-4)}`

    return (
        <Badge
            variant="secondary"
            className={cn("font-mono text-xs", className)}
        >
            {displayAddress}
        </Badge>
    )
}
