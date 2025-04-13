import React from "react";
import {
  Sheet,
  SheetDescription,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";
import {
  X,
  Check,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { api } from "@/hooks/useAxios";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JoinRequest } from "@/types";

const JoinRequestModal = ({
  isOpen,
  setIsOpen,
  joinRequests,
  setJoinRequests,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  joinRequests: JoinRequest[];
  setJoinRequests: (joinRequests: JoinRequest[]) => void;
}) => {
  const handleAccept = async (
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

  // Filter requests by status
  const pendingRequests = joinRequests.filter(
    (req) => req.status === "pending"
  );
  const approvedRequests = joinRequests.filter(
    (req) => req.status === "approved"
  );
  const rejectedRequests = joinRequests.filter(
    (req) => req.status === "rejected"
  );

  // Status icon mapping
  const statusIcons = {
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const renderRequestCard = (request: any) => (
    <Card key={request._id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {request.firstName} {request.lastName}
            </CardTitle>
            <CardDescription>Group: {request.groupName}</CardDescription>
          </div>
          <Badge
            variant={
              request.status === "pending"
                ? "outline"
                : request.status === "approved"
                ? "success"
                : "destructive"
            }
            className="flex items-center gap-1"
          >
            {statusIcons[request.status as keyof typeof statusIcons]}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 space-y-2 text-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="items-center gap-1.5 text-muted-foreground flex">
            <Mail className="h-3.5 w-3.5" />
            <span>{request.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{request.phone}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Requested {moment(request.createdAt).fromNow()}</span>
        </div>
      </CardContent>
      {request.status === "pending" && (
        <CardFooter className="pt-2 flex gap-2 justify-end">
          <Button
            onClick={() => handleAccept(request._id!, request.groupId, true)}
            variant="default"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Approve
          </Button>
          <Button
            onClick={() => handleAccept(request._id!, request.groupId, false)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <X className="h-4 w-4" /> Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join Requests
          </SheetTitle>
          <SheetDescription>
            Manage requests from users who want to join your groups
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All ({joinRequests.length})</TabsTrigger>
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

          <ScrollArea className="h-[calc(100vh-250px)]">
            <TabsContent value="all" className="mt-0">
              {joinRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">No join requests</h3>
                  <p className="text-muted-foreground text-sm">
                    You dont have any join requests at the moment
                  </p>
                </div>
              ) : (
                joinRequests.map(renderRequestCard)
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">
                    No pending requests
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    You dont have any pending join requests
                  </p>
                </div>
              ) : (
                pendingRequests.map(renderRequestCard)
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              {approvedRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">
                    No approved requests
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    You havent approved any join requests yet
                  </p>
                </div>
              ) : (
                approvedRequests.map(renderRequestCard)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              {rejectedRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">
                    No rejected requests
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    You havent rejected any join requests
                  </p>
                </div>
              ) : (
                rejectedRequests.map(renderRequestCard)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default JoinRequestModal;
