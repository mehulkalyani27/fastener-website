import Link from "next/link";
import { siteConfig } from "@/data/site";

export function Logo() {
  return (
    <Link href="/" className="text-lg font-bold">
      {siteConfig.name}
    </Link>
  );
}
