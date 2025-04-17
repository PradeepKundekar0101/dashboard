"use client";
import { api, forexApi } from "@/hooks/useAxios";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  occupation: string;
  createdAt: string;
  mt5Connection?: {
    _id: string;
    createdAt: string;
    accountId: string;
  };
}

type ConnectionFilter = "all" | "connected" | "not_connected";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionFilter, setConnectionFilter] =
    useState<ConnectionFilter>("all");
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/user/all");
        setUsers(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const searchTerm = searchQuery.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email?.toLowerCase();
        const phone = user.phoneNumber?.toString();

        const matchesSearch =
          fullName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm);

        const matchesConnectionFilter =
          connectionFilter === "all" ||
          (connectionFilter === "connected" && user.mt5Connection) ||
          (connectionFilter === "not_connected" && !user.mt5Connection);

        return matchesSearch && matchesConnectionFilter;
      })
    : [];

  const handleDisconnectBroker = async (accountId: string | undefined) => {
    if (!accountId) return;
    try {
      setIsDisconnecting(true);
      await forexApi.post(`account/disconnect`, { accountId });
      setIsDisconnectDialogOpen(false);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsDisconnecting(false);
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center w-full justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, email or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Select
          value={connectionFilter}
          onValueChange={(value: ConnectionFilter) =>
            setConnectionFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="not_connected">Not Connected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead>MT5 Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.occupation}</TableCell>
              <TableCell>
                {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {user.mt5Connection ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-green-500"
                        // onClick={() => setSelectedUser(user)}
                      >
                        Connected
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>MT5 Connection Details</DialogTitle>
                        <DialogDescription>
                          <div className="mt-4">
                            <p>Account ID: {user.mt5Connection.accountId}</p>
                            <p>
                              Connected on:{" "}
                              {format(
                                new Date(user.mt5Connection.createdAt),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4">
                        <Dialog
                          open={isDisconnectDialogOpen}
                          onOpenChange={setIsDisconnectDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              Disconnect Broker
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Disconnection</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to disconnect the MT5
                                broker? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-4">
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDisconnectBroker(
                                    user.mt5Connection?.accountId
                                  )
                                }
                                disabled={isDisconnecting}
                              >
                                {isDisconnecting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Confirm Disconnect"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsDisconnectDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" disabled>
                    Not Connected
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Users;
