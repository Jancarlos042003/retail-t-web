import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ProductAvatarProps {
  imageUrl?: string | null
  name: string
  className?: string
  fallbackClassName?: string
}

export function ProductAvatar({ imageUrl, name, className, fallbackClassName }: ProductAvatarProps) {
  return (
    <Avatar className={cn("h-9 w-9 rounded-md", className)}>
      <AvatarImage src={imageUrl ?? undefined} alt={name} />
      <AvatarFallback className={cn("rounded-md text-xs", fallbackClassName)}>
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
