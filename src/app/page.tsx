"use client";
import { useGroup } from "@/contexts/GroupContext";
import { CreateGroupModal } from "@/components/group/createGroupModal";
import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import JoinRequestModal from "@/components/group/joinRequestModal";
export default function Home() {
  const { groups } = useGroup();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const router = useRouter();
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateGroupModalOpen(true)}>
          Create Group
        </Button>
        <Button onClick={() => setIsJoinRequestModalOpen(true)}>
          Join Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card
            onClick={() => {
              router.push(`/group/${group._id}`);
            }}
            className="cursor-pointer"
            key={group._id}
          >
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        setIsOpen={setIsCreateGroupModalOpen}
      />
      <JoinRequestModal
        isOpen={isJoinRequestModalOpen}
        setIsOpen={setIsJoinRequestModalOpen}
      />
    </div>
  );
}
