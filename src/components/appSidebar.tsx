"use client";
import {
  Users2,
  TrophyIcon,
  UserPlus2,
  GraduationCap,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Mentor } from "@/types";
import { useRouter } from "next/navigation";
const adminItems = [
  {
    title: "Groups",
    url: "/groups",
    icon: TrophyIcon,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users2,
  },
  {
    title: "Group Requests",
    url: "/requests",
    icon: UserPlus2,
  },
  {
    title: "Mentors",
    url: "/mentors",
    icon: GraduationCap,
  },
  // {
  //   title: "Connections",
  //   url: "/connections_requests",
  //   icon: Link2,
  // },
];

const mentorItems = [
  {
    title: "Groups",
    url: "/groups",
    icon: TrophyIcon,
  },
];
export function AppSidebar() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const router = useRouter();
  const items = mentor ? mentorItems : adminItems;
  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        const mentor = localStorage.getItem("mentor");
        if (mentor) {
          setMentor(JSON.parse(mentor));
        }
      } else {
        router.push("/login");
      }
    };

    verifyAuth();
  }, []);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>EarningEdge Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button
              variant="link"
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
            >
              <LogOut size={18} />
              Logout
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
