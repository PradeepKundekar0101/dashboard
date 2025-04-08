"use client";
import { CreateGroupModal } from "@/components/group/createGroupModal";
import { useState, useEffect } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import JoinRequestModal from "@/components/group/joinRequestModal";
import {
  PlusCircle,
  UserPlus,
  Users,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { api } from "@/hooks/useAxios";

// Define types that were previously in GroupContext
export type Group = {
  _id?: string;
  name: string;
  description: string;
  freezeDuration?: number;
  freezeThreshold?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  participantsCount?: number;
  isPublic?: boolean;
  isRegistrationOpen?: boolean;
  initialBalance: number;
};

export type JoinRequest = {
  _id?: string;
  groupId: string;
  groupName: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export default function Home() {
  // State that was previously in GroupContext
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const router = useRouter();
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);

  // Fetch groups and join requests directly in the page
  const fetchGroups = async () => {
    try {
      const response = await api.get("/group");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchJoinRequests = async () => {
    try {
      const response = await api.get("/group/getParticipants/participants");
      const joinRequests = response.data
        .map((participant: any) => {
          if (participant && participant.groupId && participant.userId) {
            return {
              status: participant.status,
              groupId: participant.groupId._id,
              groupName: participant.groupId.name,
              userId: participant.userId._id,
              firstName: participant.userId.firstName,
              lastName: participant.userId.lastName,
              email: participant.userId.email,
              phone: participant.userId.phoneNumber,
              createdAt: participant.createdAt,
              updatedAt: participant.updatedAt,
              _id: participant._id,
            };
          }
          return null;
        })
        .filter(Boolean); // Filter out null values
      setJoinRequests(joinRequests);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchGroups();
    fetchJoinRequests();
  }, []);

  // Create group function
  const createGroup = async (group: Group) => {
    try {
      const response = await api.post("/group", group);
      setGroups([...groups, response.data]);
      return response.data;
    } catch (error) {
      console.error("Failed to create group:", error);
      throw new Error("Failed to create group");
    }
  };

  // Get pending join requests count
  const pendingRequestsCount = joinRequests.filter(
    (request) => request.status === "pending"
  ).length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Group Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your groups and team collaborations in one place. Create new
          groups or join existing ones.
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-10">
        <Button
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="flex items-center gap-2"
          size="lg"
        >
          <PlusCircle size={18} />
          Create Group
        </Button>
        <Button
          onClick={() => setIsJoinRequestModalOpen(true)}
          className="flex items-center gap-2"
          variant="outline"
          size="lg"
        >
          <UserPlus size={18} />
          Join Request {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-10 text-center">
          <Users className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't created or joined any groups yet.
          </p>
          <Button onClick={() => setIsCreateGroupModalOpen(true)}>
            Create Your First Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group._id}
              className="transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer overflow-hidden"
              onClick={() => router.push(`/group/${group._id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {group.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={16} />
                  <span>{group.participantsCount || 0} Members</span>
                </div>

                {(group.startDate || group.endDate) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    <span>
                      {group.startDate &&
                        new Date(group.startDate).toLocaleDateString()}
                      {group.startDate && group.endDate && " - "}
                      {group.endDate &&
                        new Date(group.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  View Details <ArrowRight size={14} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        setIsOpen={setIsCreateGroupModalOpen}
        createGroup={createGroup}
        setGroups={setGroups}
        groups={groups}
      />
      <JoinRequestModal
        isOpen={isJoinRequestModalOpen}
        setIsOpen={setIsJoinRequestModalOpen}
        joinRequests={joinRequests}
        setJoinRequests={setJoinRequests}
      />
    </div>
  );
}
