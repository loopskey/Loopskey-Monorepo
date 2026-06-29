import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex-shrink-0 flex items-center">
      <Image
        priority
        width={100}
        height={200}
        alt="Loopskey-logo"
        src={"/Loopskey.png"}
        className="h-8 w-auto"
      />
    </Link>
  );
};
