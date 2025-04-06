"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { forexApi } from "@/hooks/useAxios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCcw, TrendingUp, Clock, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import FreezeModal from "@/components/group/freezeModal";
import UnfreezeModal from "@/components/group/unfreezeModal";

const GroupPage = () => {
  interface LeaderBoardData {
    timestamp: number;
    leaderboard: Leaderboard[];
  }
  interface FrozenAccount {
    accountId: string;
    frozenAt: Date;
    initialEquity: number;
    releaseTimeout: NodeJS.Timeout;
    reason: string;
    active: boolean;
  }
  interface Leaderboard {
    accountId: string;
    name: string;
    pnlPercentage: number;
    totalFreezesCount: number;
    totalTrades: number;
    groupName: string;
    groupId: string;
    rank: number;
    profitLoss: number;
    balance: number;
    equity: number;
    userName: string;
    userId: string;
    freezeDetails: FrozenAccount;
  }
  const { groupId } = useParams();
  const [leaderboard, setLeaderboard] = useState<LeaderBoardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [showFreezeModal, setShowFreezeModal] = useState<boolean>(false);
  const [showUnfreezeModal, setShowUnfreezeModal] = useState<boolean>(false);
  const fetchLeaderBoardData = async () => {
    try {
      if (!leaderboard) {
        setLoading(true);
      }
      const response = await forexApi.get(`leaderboard/${groupId}`);
      setLeaderboard(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Failed to fetch leaderboard data");
      console.error(err);
    } finally {
      if (!leaderboard) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLeaderBoardData();
    const refreshInterval = setInterval(() => {
      fetchLeaderBoardData();
    }, 3 * 1000);

    return () => clearInterval(refreshInterval);
  }, [groupId, fetchLeaderBoardData]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            Track and compare trading performance across accounts
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={fetchLeaderBoardData}
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {leaderboard &&
        leaderboard.leaderboard &&
        leaderboard.leaderboard.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">
                    {leaderboard.leaderboard[0]?.groupName || "Group"}
                  </CardTitle>
                  <CardDescription>ID: {groupId}</CardDescription>
                </div>
                {lastUpdated && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    Last updated: {formatTime(lastUpdated)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Accounts
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Analytics
                </Button>
                <Button variant="outline" size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Winners Report
                </Button>
              </div>

              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">PnL %</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Equity</TableHead>
                      <TableHead className="text-center">Trades</TableHead>
                      <TableHead className="text-center">Freezes</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.leaderboard.map((item) => (
                      <TableRow
                        onClick={() => {
                          router.push(`/user/${item.userId}`);
                        }}
                        className="cursor-pointer"
                        key={item.accountId}
                      >
                        <TableCell className="font-medium">
                          <Badge
                            variant={item.rank <= 3 ? "default" : "outline"}
                          >
                            {item.rank}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.userName || "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            item.pnlPercentage >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.pnlPercentage >= 0 ? "+" : ""}
                          {item.pnlPercentage.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {item.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {item.equity.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.totalTrades}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.totalFreezesCount}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.freezeDetails.active) {
                                setSelectedAccountId(item.accountId);
                                setShowUnfreezeModal(true);
                              } else {
                                setSelectedAccountId(item.accountId);
                                setShowFreezeModal(true);
                              }
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            {item.freezeDetails.active ? "Unfreeze" : "Freeze"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      {showFreezeModal && (
        <FreezeModal
          accountId={selectedAccountId || ""}
          onClose={() => setShowFreezeModal(false)}
          groupId={groupId as string}
        />
      )}
      {showUnfreezeModal && (
        <UnfreezeModal
          accountId={selectedAccountId || ""}
          onClose={() => setShowUnfreezeModal(false)}
          groupId={groupId as string}
        />
      )}
    </div>
  );
};

export default GroupPage;
