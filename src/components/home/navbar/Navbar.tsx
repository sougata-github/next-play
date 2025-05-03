import { SidebarTrigger } from "@/components/ui/sidebar";
import AuthButton from "@/components/auth/AuthButton";
import Image from "next/image";
import Link from "next/link";

import SearchInput from "./SearchInput";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 flex items-center px-2 pr-5 z-50 bg-background border-b">
      <div className="flex items-center gap-4 w-full">
        {/* Menu and Logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />

          <Link href="/">
            <div className="p-4 flex items-center gap-2">
              <Image src="/logo.svg" height={40} width={40} alt="logo" />
              <p className="text-xl font-semibold tracking-tight max-sm:hidden">
                NextPlay
              </p>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center max-w-[700px] mx-auto">
          <SearchInput />
        </div>

        <div className="flex-shrink-0 items-center flex gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
