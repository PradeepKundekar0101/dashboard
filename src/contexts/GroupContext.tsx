"use client";
import { api } from "@/hooks/useAxios";

import { createContext, useContext, useEffect, useState } from "react";
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
type GroupContextType = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  createGroup: (group: Group) => Promise<void>;

  joinRequests: JoinRequest[];
  setJoinRequests: (joinRequests: JoinRequest[]) => void;
};

const GroupContext = createContext<GroupContextType>({
  groups: [],
  setGroups: () => {},
  createGroup: async () => {},
  joinRequests: [],
  setJoinRequests: () => {},
});

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const fetchGroups = async () => {
    const response = await api.get("/group");
    setGroups(response.data);
  };
  const fetchJoinRequests = async () => {
    const response = await api.get("/group/getParticipants/participants");
    console.log(response.data);
    const joinRequests = response.data.map((participant: any) => {
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
    });
    setJoinRequests(joinRequests);
  };
  useEffect(() => {
    fetchGroups();
    fetchJoinRequests();
  }, []);

  const createGroup = async (group: Group) => {
    try {
      const response = await api.post("/groups", group);
      setGroups([...groups, response.data]);
    } catch (error) {
      throw new Error("Failed to create group");
    }
  };

  return (
    <GroupContext.Provider
      value={{ groups, setGroups, createGroup, joinRequests, setJoinRequests }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  return useContext(GroupContext);
};
