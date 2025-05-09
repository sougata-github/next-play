import HomeSidebar from "@/components/home/sidebar/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navbar from "@/components/home/navbar/Navbar";
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
          <HomeSidebar />
          <main className="flex-1 overflow-y-auto">
            <Banner />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
