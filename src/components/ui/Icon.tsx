import Image from "next/image";
import type { IconName } from "@/types/dashboard.types";

const iconPaths: Record<IconName, string> = {
  apps: "/assets/icons/apps.svg",
  building: "/assets/icons/building.svg",
  cards: "/assets/icons/cards.svg",
  card: "/assets/icons/card.svg",
  swap: "/assets/icons/swap.svg",
  server: "/assets/icons/server.svg",
  key: "/assets/icons/key.svg",
  settings: "/assets/icons/settings.svg",
  users: "/assets/icons/users.svg",
  receipt: "/assets/icons/receipt.svg",
  trend: "/assets/icons/trend.svg",
  shield: "/assets/icons/shield.svg",
  arrow: "/assets/icons/round-arrow.svg",
  menu: "/assets/icons/menu.svg",
  eye: "/assets/icons/eye.svg",
  "eye-off": "/assets/icons/eye-off.svg",
  back: "/assets/icons/round-arrow.svg",
};

export function Icon({
  name,
  className = "",
  alt = "",
}: {
  name: IconName;
  className?: string;
  alt?: string;
}) {
  return (
    <Image
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`w-6 h-6 shrink-0 object-contain ${className}`}
      height={24}
      src={iconPaths[name]}
      unoptimized
      width={24}
    />
  );
}
