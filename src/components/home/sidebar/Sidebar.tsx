import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { SignedIn } from "@clerk/nextjs";

import SubscriptionsSection from "./SubscriptionsSection";
import PersonalSection from "./PersonalSection";
import MainSection from "./MainSection";

const HomeSidebar = () => {
  return (
    <Sidebar className="pt-16 z-40 border-r" collapsible="icon">
      <SidebarContent className="bg-background">
        <MainSection />
        <Separator />
        <PersonalSection />

        <SignedIn>
          <Separator />
          <SubscriptionsSection />
        </SignedIn>
      </SidebarContent>
    </Sidebar>
  );
};

export default HomeSidebar;
