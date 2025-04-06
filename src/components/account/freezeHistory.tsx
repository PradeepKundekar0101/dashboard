import React, { useEffect, useState } from "react";
import { Account } from "@/types";
import { forexApi } from "@/hooks/useAxios";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface FreezeHistoryItem {
  _id: string;
  accountId: string;
  reason: string;
  automated: boolean;
  frozenAt: string;
  initialEquity: number;
  groupId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
}

const FreezeHistory = ({ account }: { account: Account }) => {
  const [freezeHistory, setFreezeHistory] = useState<FreezeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreezeHistory = async () => {
      try {
        const response = await forexApi.get(
          `/riskmanagement/frozen/${account.groupId}/${account.accountId}`
        );
        setFreezeHistory(response.data);
      } catch (error) {
        console.error("Error fetching freeze history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreezeHistory();
  }, [account.groupId, account.accountId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Freeze History</CardTitle>
        <CardDescription>Account freeze records</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading freeze history...</p>
        ) : freezeHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frozen At</TableHead>
                <TableHead>Released At</TableHead>
                <TableHead>Initial Equity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {freezeHistory.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>
                    <Badge variant={item.automated ? "outline" : "default"}>
                      {item.automated ? "Automated" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.frozenAt), "PPP p")}
                  </TableCell>
                  <TableCell>
                    {item.releasedAt
                      ? format(new Date(item.releasedAt), "PPP p")
                      : "-"}
                  </TableCell>
                  <TableCell>${item.initialEquity.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.active ? "destructive" : "secondary"}>
                      {item.active ? "Active" : "Released"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No freeze history found</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FreezeHistory;
