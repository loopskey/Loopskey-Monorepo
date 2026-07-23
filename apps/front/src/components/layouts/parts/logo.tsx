import Image from "next/image";
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex flex-shrink-0 items-center">
      {/* The wordmark is a light lavender gradient that reads on the dark
          background but washes out on white, so light mode uses a brand
          violet-to-blue variant instead. Both are pure CSS visibility swaps,
          so there is no theme flash or hydration mismatch. */}
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
