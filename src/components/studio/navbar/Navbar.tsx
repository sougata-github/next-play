import { SidebarTrigger } from "@/components/ui/sidebar";
import AuthButton from "@/components/auth/AuthButton";
import Image from "next/image";
import Link from "next/link";

import StudioUploadModal from "../StudioUploadModal";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 flex items-center px-2 pr-5 z-50 bg-background border-b">
      <div className="flex items-center gap-4 w-full">
        {/* Menu and Logo */}
        <div className="flex items-center flex-shrink-0">
          <SidebarTrigger />

          <Link href="/studio">
            <div className="p-4 flex items-center gap-2">
              <Image src="/logo.svg" height={40} width={40} alt="logo" />
              <p className="text-xl font-semibold tracking-tight max-sm:hidden">
                Studio
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1" />

        <div className="flex-shrink-0 items-center flex gap-4">
          <StudioUploadModal />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
