"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { mainSectionLinks } from "@/constants";
import { useAuth } from "@clerk/clerk-react";
import { useClerk } from "@clerk/nextjs";
import Image from "next/image";

import Link from "next/link";

const MainSection = () => {
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  return (
    <SidebarGroup>
      <SidebarHeader className="max-md:block hidden">
        <Link href="/">
          <div className="pl-0 pt-2.5 flex items-center gap-2">
            <Image src="/logo.svg" height={40} width={40} alt="logo" />
            <p className="text-xl font-semibold tracking-tight">NextPlay</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarGroupContent>
        <SidebarMenu className="mt-4 md:mt-0">
          {mainSectionLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={false}
                onClick={(e) => {
                  if (!isSignedIn && item.auth) {
                    e.preventDefault();
                    return clerk.openSignIn();
                  }
                }}
              >
                <Link href={item.url} className="flex items-center gap-4">
                  <item.icon />
                  <span className="text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default MainSection;
