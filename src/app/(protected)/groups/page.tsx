"use client";
import React from "react";
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

import { PlusCircle, Users, ArrowRight, Calendar } from "lucide-react";
import { api } from "@/hooks/useAxios";
import { jwtDecode } from "jwt-decode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group, Mentor } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const Groups = () => {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const { mentor } = useAuth();
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
  const fetchGroups = async () => {
    try {
      const decodedToken = jwtDecode(localStorage.getItem("authToken") || "");
      if (!decodedToken) {
        localStorage.clear();
        router.push("/login");
        return;
      }
      if (localStorage.getItem("mentor")) {
        const mentor = JSON.parse(localStorage.getItem("mentor") || "");
        const response = await api.get(`/forexMentor/getGroups/${mentor?._id}`);
        setGroups(response.data);
      } else {
        const response = await api.get("/group");
        setGroups(response.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  const fetchMentors = async () => {
    try {
      const response = await api.get("/forexMentor/getMentors");
      setMentors(response.data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchMentors();
  }, [mentor]);
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-10 flex text-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Group Dashboard
        </h1>
        <div className="flex justify-center gap-4 mb-10">
          {!mentor && (
            <div className="flex gap-4">
              <Button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="flex items-center gap-2"
                size="lg"
              >
                <PlusCircle size={18} />
                Create Group
              </Button>
            </div>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-10 text-center">
          <Users className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-6">
            You havent created or joined any groups yet.
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
              onClick={() => router.push(`/groups/${group._id}`)}
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
                {!mentor && (
                  <Select
                    value={group.mentorId?._id || undefined}
                    onValueChange={async (e) => {
                      if (e === "none") {
                        await api.put(`/group/updateMentor/${group._id}`, {
                          mentorId: null,
                        });
                      } else {
                        await api.put(`/group/updateMentor/${group._id}`, {
                          mentorId: e,
                        });
                      }
                      fetchGroups();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.map((mentor) => (
                        <SelectItem key={mentor._id} value={mentor._id}>
                          {mentor.firstname}
                        </SelectItem>
                      ))}
                      <SelectItem value="none">No Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
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

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        setIsOpen={setIsCreateGroupModalOpen}
        createGroup={createGroup}
        setGroups={setGroups}
        groups={groups}
      />
    </div>
  );
};

export default Groups;
