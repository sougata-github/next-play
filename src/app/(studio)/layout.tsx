import StudioSidebar from "@/components/studio/sidebar/StudioSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/studio/navbar/Navbar";
import Banner from "@/components/Banner";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="w-full">
        <Navbar />
        <div className="flex min-h-screen pt-[4rem]">
          <StudioSidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Banner />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
