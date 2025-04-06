import React from "react";
import {
  Sheet,
  SheetDescription,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";

import { useGroup } from "@/contexts/GroupContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";
import { X } from "lucide-react";
import { Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { api } from "@/hooks/useAxios";
const JoinRequestModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const { joinRequests, setJoinRequests } = useGroup();
  const handleAccept = async (
    participantId: string,
    groupId: string,
    accept: boolean
  ) => {
    await api.put(`/group/${groupId}/participants/${participantId}`, {
      status: accept ? "approved" : "rejected",
    });
    setJoinRequests(
      joinRequests.filter((request) => request._id !== participantId)
    );
  };
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Join Request</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {joinRequests.length === 0 ? (
                <div className="flex flex-col gap-4">
                  <p>No join requests</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {joinRequests.map((request) => (
                    <Card key={request._id}>
                      <CardHeader>
                        <CardTitle>{request.firstName}</CardTitle>
                        <CardDescription>{request.groupName}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>{request.status}</p>
                        <p>{request.email}</p>
                        <p>{request.phone}</p>
                        <p>{moment(request.createdAt).fromNow()}</p>
                      </CardContent>
                      {request.status !== "pending" && (
                        <div>
                          <p>Status: {request.status}</p>
                        </div>
                      )}
                      {request.status === "pending" && (
                        <div>
                          <Button
                            onClick={() => {
                              handleAccept(request._id!, request.groupId, true);
                            }}
                            variant="outline"
                          >
                            <Check /> Accept
                          </Button>
                          <Button
                            onClick={() => {
                              handleAccept(
                                request._id!,
                                request.groupId,
                                false
                              );
                            }}
                            variant="outline"
                          >
                            <X /> Reject
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
};

export default JoinRequestModal;
