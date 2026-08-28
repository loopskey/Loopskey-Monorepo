import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex flex-shrink-0 items-center">
      <Image
        priority
        width={205}
        height={54}
        alt="Loopskey-logo"
        src="/Loopskey-light.svg"
        className="h-8 w-auto dark:hidden"
      />
      <Image
        priority
        width={205}
        height={54}
        alt="Loopskey-logo"
        src="/Loopskey.svg"
        className="hidden h-8 w-auto dark:block"
      />
    </Link>
  );
};
