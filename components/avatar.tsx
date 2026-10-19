import Image from "next/image";
import { getAvatarUrl } from "@/lib/profile";
import { cn } from "@/lib/utils";

type AvatarProps = {
  username: string;
  style: string;
  size?: number;
  className?: string;
};

export function Avatar({
  username,
  style,
  size = 80,
  className,
}: AvatarProps) {
  return (
    <span
      className={cn(
        "block shrink-0 overflow-hidden rounded-md border border-line bg-line",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={getAvatarUrl(username, style)}
        alt={username}
        width={size}
        height={size}
        unoptimized
        loading="eager"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
