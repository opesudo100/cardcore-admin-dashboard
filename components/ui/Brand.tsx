import Image from "next/image";

export function Brand({ logo }: { logo: string }) {
  const src = logo === "CloudCard" ? "/assets/images/cloud_logo.svg" : "/assets/images/logo.svg";

  return <Image alt={`${logo} by Sudo`} className="w-[120px] h-auto object-contain" height={42} priority src={src} unoptimized width={148} />;
}
