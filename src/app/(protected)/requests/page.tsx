"use client";
import { JoinRequest } from "@/types";
import React, { useEffect, useState } from "react";
import { api } from "@/hooks/useAxios";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const JoinRequests = () => {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJoinRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/group/getParticipants/participants");
      const joinRequests = response.data
        //@ts-ignore
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
        .filter(Boolean);
      setJoinRequests(joinRequests);
    } catch (error) {
      console.error("Error fetching join requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (
    participantId: string,
    groupId: string,
    accept: boolean
  ) => {
    try {
      await api.put(`/group/${groupId}/participants/${participantId}`, {
        status: accept ? "approved" : "rejected",
      });
      setJoinRequests(
        joinRequests.map((request) =>
          request._id === participantId
            ? { ...request, status: accept ? "approved" : "rejected" }
            : request
        )
      );
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const { mentor } = useAuth();

  useEffect(() => {
    if (!mentor) {
      fetchJoinRequests();
    }
  }, [mentor]);

  // Filter requests by search query
  const filterRequests = (requests: JoinRequest[]) => {
    if (!searchQuery) return requests;

    const query = searchQuery.toLowerCase();
    return requests.filter(
      (request) =>
        `${request.firstName} ${request.lastName}`
          .toLowerCase()
          .includes(query) ||
        request.email.toLowerCase().includes(query) ||
        request.groupName.toLowerCase().includes(query)
    );
  };

  // Filter requests by status
  const allFilteredRequests = filterRequests(joinRequests);
  const pendingRequests = filterRequests(
    joinRequests.filter((req) => req.status === "pending")
  );
  const approvedRequests = filterRequests(
    joinRequests.filter((req) => req.status === "approved")
  );
  const rejectedRequests = filterRequests(
    joinRequests.filter((req) => req.status === "rejected")
  );

  const RequestsTable = ({ requests }: { requests: JoinRequest[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Requested</TableHead>
          <TableHead>Status</TableHead>
          {requests.some((req) => req.status === "pending") && (
            <TableHead>Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request._id}>
            <TableCell>
              {request.firstName} {request.lastName}
            </TableCell>
            <TableCell>{request.groupName}</TableCell>
            <TableCell>{request.email}</TableCell>
            <TableCell>{request.phone}</TableCell>
            <TableCell>
              {request.createdAt
                ? format(new Date(request.createdAt), "PPP")
                : "-"}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  request.status === "pending"
                    ? "outline"
                    : request.status === "approved"
                    ? "success"
                    : "destructive"
                }
              >
                {request.status.charAt(0).toUpperCase() +
                  request.status.slice(1)}
              </Badge>
            </TableCell>
            {request.status === "pending" && (
              <TableCell className="flex gap-2">
                <Button
                  onClick={() =>
                    handleRequestAction(request._id!, request.groupId, true)
                  }
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" /> Accept
                </Button>
                <Button
                  onClick={() =>
                    handleRequestAction(request._id!, request.groupId, false)
                  }
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card className="w-full rounded-none border-none">
      <CardHeader>
        <CardTitle className="mb-4">Group Join Requests</CardTitle>

        <div className=" relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, group, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading join requests...</div>
        ) : joinRequests.length > 0 ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all">
                All ({allFilteredRequests.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <RequestsTable requests={allFilteredRequests} />
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <RequestsTable requests={pendingRequests} />
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              <RequestsTable requests={approvedRequests} />
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              <RequestsTable requests={rejectedRequests} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-4">No join requests found</div>
        )}
      </CardContent>
    </Card>
  );
};

export default JoinRequests;
