"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api, forexApi } from "@/hooks/useAxios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw } from "lucide-react";
import Positions from "@/components/account/positions";
import { UserData } from "@/types";
import Deals from "@/components/account/deals";
import Orders from "@/components/account/orders";
import FreezeHistory from "@/components/account/freezeHistory";
import { pnlData, usersData } from "@/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UserPage = () => {
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [forexStats, setForexStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("positions");
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const [type, setType] = useState<"real" | "demo">("real");
  const fetchUserData = useCallback(async () => {
    try {
      console.log("Fetching user data for userId:", userId);
      const response = await forexApi.get(`account/user/${userId}`);
      console.log("User data response:", response.data);
      setUserData(response.data);
      setIsLoading(false);
      if (!response.data.account) {
        setType("demo");
        const account = usersData[userId as keyof typeof usersData];
        account && setUserData({ account });
      } else {
        setType("real");
      }
      //@ts-ignore
    } catch (err: any) {
      console.error("Failed to fetch user data:", err.message || err);
      setError(err.message || "Failed to fetch user data");
      setIsLoading(false);
    }
  }, [userId, type]);

  const fetchForexStats = useCallback(async () => {
    try {
      if (!accountId) {
        console.log("No accountId provided for forex stats");
        return;
      }
      setIsRefreshing(true);
      console.log("Fetching forex stats for accountId:", accountId);
      const response = await api.get(`/forexStats/${accountId}?type=${type}`);
      if (response?.data) {
        setForexStats(response.data);
        console.log("Forex stats fetched successfully");
      } else {
        console.error("No data received from forex stats API");
      }
    } catch (err: any) {
      console.error("Failed to fetch forex stats:", err.message || err);
    } finally {
      setIsRefreshing(false);
    }
  }, [accountId, type]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchUserData();
    fetchForexStats();
  };

  useEffect(() => {
    fetchUserData();
    fetchForexStats();

    // Only set up polling if it's not paused
    if (!isPollingPaused) {
      // User data polling - every 2 seconds
      const userDataPollingInterval = setInterval(() => {
        fetchUserData();
      }, 2000);

      // Forex stats polling - every 5 seconds
      const forexStatsPollingInterval = setInterval(() => {
        fetchForexStats();
      }, 5000);

      return () => {
        clearInterval(userDataPollingInterval);
        clearInterval(forexStatsPollingInterval);
      };
    }
  }, [fetchUserData, fetchForexStats, isPollingPaused]);

  // Pause polling when viewing closed trades
  useEffect(() => {
    setIsPollingPaused(activeTab === "closedTrades");
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userData) {
    const { account } = userData;
    const openTrades = forexStats?.openTrades || [];
    const closedTrades = forexStats?.trades || [];

    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="icon"
                  className="mr-2"
                >
                  <ChevronLeft className="" />
                </Button>
                <CardTitle className="text-2xl">User Profile</CardTitle>
              </div>
              <CardDescription>Account details and performance</CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Stats"}
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                User
              </h3>
              <p className="text-lg font-semibold">
                {account?.firstName || ""} {account?.lastName || ""}
              </p>
              <p className="text-sm">{account?.email || ""}</p>
              <p className="text-sm">{account?.phonenumber || ""}</p>
              {userData?.account?.joined && (
                <p className="text-lg">Joined: {account?.joined || ""}</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Account
              </h3>
              <p className="text-lg font-semibold">{account?.name || ""}</p>
              <p className="text-sm">ID: {account?.accountId || ""}</p>
            </div>
          </CardContent>
        </Card>

        {/* Debug info - remove in production */}
        {!account && type === "real" && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                User data available but account data is missing.
              </p>
              <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${account?.balance?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Equity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${account?.equity?.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profit %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  account?.pnlPercentage &&
                  parseFloat(account.pnlPercentage.toString()) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {account?.pnlPercentage >= 0 ? "+" : ""}
                {account?.pnlPercentage?.toFixed(2) || "0.00"}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Freezes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {account?.groupId === "682a3cb44d4c7d8a75a15a30"
                  ? (account?.freezeCount + 1) * 4
                  : account?.freezeCount || 0}
              </p>
            </CardContent>
          </Card>
        </div>
        {type === "demo" && pnlData[userId as keyof typeof pnlData] && (
          <div>
            <Table className="text-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>PnL Percentage</TableHead>
                  <TableHead>PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pnlData[userId as keyof typeof pnlData].map((item: any) => (
                  <TableRow key={item.month}>
                    <TableCell>{item.month}</TableCell>
                    <TableCell
                      className={`${
                        item.pnlPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.pnlPercentage} %
                    </TableCell>
                    <TableCell>${item.pnl}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Tabs Section */}
        <Tabs
          defaultValue="positions"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-auto md:w-[800px] grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            {/* <TabsTrigger value="deals">Deals</TabsTrigger> */}
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="freezeHistory">Freezes</TabsTrigger>
            <TabsTrigger value="openTrades">Open Trades</TabsTrigger>
            <TabsTrigger value="closedTrades">Closed Trades</TabsTrigger>
          </TabsList>

          {/* Standard Tabs */}
          <TabsContent value="positions">
            <Positions account={account || {}} />
          </TabsContent>

          <TabsContent value="deals">
            <Deals account={account || {}} />
          </TabsContent>

          <TabsContent value="orders">
            <Orders account={account || {}} />
          </TabsContent>

          <TabsContent value="freezeHistory">
            <FreezeHistory account={account || {}} />
          </TabsContent>

          {/* Open Trades Tab */}
          <TabsContent value="openTrades">
            <Card>
              <CardHeader>
                <CardTitle>Open Trades</CardTitle>
                <CardDescription>
                  Currently active trading positions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {openTrades && openTrades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Symbol</th>
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Volume</th>
                          <th className="p-2 text-left">Open Price</th>
                          <th className="p-2 text-left">Profit</th>
                          <th className="p-2 text-left">Open Time</th>
                          <th className="p-2 text-left">Market Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openTrades.map((trade: any, index: number) => (
                          <tr
                            key={trade._id || index}
                            className="border-b border-muted"
                          >
                            <td className="p-2">{trade?.symbol || ""}</td>
                            <td className="p-2">
                              {trade?.type === "POSITION_TYPE_BUY"
                                ? "BUY"
                                : "SELL"}
                            </td>
                            <td className="p-2">{trade?.volume || 0}</td>
                            <td className="p-2">{trade?.openPrice || 0}</td>
                            <td
                              className={`p-2 ${
                                trade?.profit && parseFloat(trade.profit) >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {trade?.profit && parseFloat(trade.profit) >= 0
                                ? "+"
                                : ""}
                              {trade?.profit || "0.00"}
                            </td>
                            <td className="p-2">
                              {trade?.openTime
                                ? new Date(trade.openTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="p-2">
                              $
                              {trade?.marketValue
                                ? trade.marketValue.toFixed(2)
                                : "0.00"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No open trades available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Closed Trades Tab */}
          <TabsContent value="closedTrades">
            <Card>
              <CardHeader>
                <CardTitle>Closed Trades</CardTitle>
                <CardDescription>
                  Historical record of completed trades
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isRefreshing ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading trades...</span>
                  </div>
                ) : closedTrades && closedTrades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Symbol</th>
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Volume</th>
                          <th className="p-2 text-left">Open Price</th>
                          <th className="p-2 text-left">Close Price</th>
                          <th className="p-2 text-left">Profit</th>
                          <th className="p-2 text-left">Pips</th>
                          <th className="p-2 text-left">Open Time</th>
                          <th className="p-2 text-left">Close Time</th>
                          <th className="p-2 text-left">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {closedTrades.map((trade: any, index: number) => (
                          <tr
                            key={trade._id || index}
                            className="border-b border-muted"
                          >
                            <td className="p-2">{trade?.symbol || ""}</td>
                            <td className="p-2">
                              {trade?.type === "DEAL_TYPE_SELL"
                                ? "SELL"
                                : trade?.type === "DEAL_TYPE_BUY"
                                ? "BUY"
                                : trade?.type === "DEAL_TYPE_BALANCE"
                                ? "BALANCE"
                                : trade?.type || ""}
                            </td>
                            <td className="p-2">{trade?.volume || ""}</td>
                            <td className="p-2">{trade?.openPrice || ""}</td>
                            <td className="p-2">{trade?.closePrice || ""}</td>
                            <td
                              className={`p-2 ${
                                trade?.profit && parseFloat(trade.profit) >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {trade?.profit && parseFloat(trade.profit) >= 0
                                ? "+"
                                : ""}
                              {trade?.profit || "0.00"}
                            </td>
                            <td className="p-2">{trade?.pips || ""}</td>
                            <td className="p-2">
                              {trade?.openTime
                                ? new Date(trade.openTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="p-2">
                              {trade?.closeTime
                                ? new Date(trade.closeTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="p-2">
                              {trade?.durationInMinutes
                                ? `${trade.durationInMinutes} min`
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No trade history available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
};

export default UserPage;
