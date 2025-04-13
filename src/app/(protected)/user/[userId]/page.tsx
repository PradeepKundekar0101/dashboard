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

// Import Recharts components
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

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

  const fetchUserData = useCallback(async () => {
    try {
      console.log("Fetching user data for userId:", userId);
      const response = await forexApi.get(`account/user/${userId}`);
      console.log("User data response:", response.data);
      setUserData(response.data);
      setIsLoading(false);
      //@ts-ignore
    } catch (err: any) {
      console.error("Failed to fetch user data:", err.message || err);
      setError(err.message || "Failed to fetch user data");
      setIsLoading(false);
    }
  }, [userId]);

  const fetchForexStats = useCallback(async () => {
    try {
      if (!accountId) {
        console.log("No accountId provided for forex stats");
        return;
      }
      setIsRefreshing(true);
      console.log("Fetching forex stats for accountId:", accountId);
      const response = await api.get(`/forexStats/${accountId}`);
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
  }, [accountId]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchUserData();
    fetchForexStats();
  };

  useEffect(() => {
    fetchUserData();
    fetchForexStats();

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
  }, [fetchUserData, fetchForexStats]);

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
    const profitClass =
      account?.profitLoss !== undefined &&
      parseFloat(account.profitLoss?.toFixed(2) || "0") >= 0
        ? "text-green-500"
        : "text-red-500";

    // Format metrics from forexStats if available
    const metrics = forexStats?.metrics || {};
    const openTrades = forexStats?.openTrades || [];

    // Prepare data for charts
    const balanceGrowthData =
      metrics?.dailyGrowth?.map((day: any) => ({
        date: day.date,
        Balance: day.balance || 0,
      })) || [];

    const winLossData = [
      { name: "Won", value: metrics?.wonTrades || 0 },
      { name: "Lost", value: metrics?.lostTrades || 0 },
    ];

    const currencyData = (metrics?.currencySummary || []).map(
      (currency: any) => ({
        name: currency.currency,
        Profit: parseFloat(currency.total.profit) || 0,
      })
    );

    const dayOfWeekData = (metrics?.closeTradesByWeekDay || []).map(
      (day: any) => {
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return {
          day: dayNames[day.day],
          Profit: parseFloat(day.profit) || 0,
          "Win Rate": day.wonTradesPercent || 0,
        };
      }
    );

    const hourlyData = (metrics?.openTradesByHour || []).map((hour: any) => ({
      hour: `${hour.hour}:00`,
      Trades: hour.trades || 0,
      Profit: parseFloat(hour.profit) || 0,
      "Win Rate": hour.wonTradesPercent || 0,
    }));

    const riskOfRuinData = (metrics?.riskOfRuin || []).map((risk: any) => ({
      "Loss Size": `${(risk.lossSize * 100).toFixed(0)}%`,
      Probability: risk.probabilityOfLoss * 100,
    }));

    const durationData = (metrics?.tradeDurationDiagram || []).map(
      (duration: any) => {
        const totalTrades = duration.trades;
        const wonTrades = duration.won?.gains?.length || 0;
        const winRate = totalTrades > 0 ? (wonTrades / totalTrades) * 100 : 0;

        return {
          Duration: duration.name,
          Trades: totalTrades,
          "Win Rate": winRate,
        };
      }
    );

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
              <p className="text-sm">Phone: {account?.phonenumber || ""}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Account
              </h3>
              <p className="text-lg font-semibold">{account?.name || ""}</p>
              <p className="text-sm">ID: {account?.accountId || ""}</p>
            </div>
            {/* <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Performance
              </h3>
              <p className="text-lg font-semibold">
                Trade Count: {account?.tradeCount || 0}
              </p>
              <p className={`text-lg font-semibold ${profitClass}`}>
                Profit/Loss: {account?.profitLoss?.toFixed(2) || "0.00"}
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Debug info - remove in production */}
        {!account && (
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
                $
                {metrics?.balance?.toFixed(2) ||
                  account?.balance?.toFixed(2) ||
                  "0.00"}
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
                $
                {metrics?.equity?.toFixed(2) ||
                  account?.equity?.toFixed(2) ||
                  "0.00"}
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
                  metrics?.gain && parseFloat(metrics.gain) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {metrics?.gain >= 0 ? "+" : ""}
                {metrics?.gain?.toFixed(2) ||
                  account?.pnlPercentage?.toFixed(2) ||
                  "0.00"}
                %
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
              <p className="text-2xl font-bold">{account?.freezeCount || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Extended KPIs */}
        {forexStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {metrics?.wonTradesPercent?.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Won: {metrics?.wonTrades || 0} / Lost:{" "}
                  {metrics?.lostTrades || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Profit Factor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {metrics?.profitFactor?.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Max Drawdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-500">
                  -{metrics?.maxDrawdown?.toFixed(2) || "0.00"}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Trade Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{metrics?.trades || 0}</p>
              </CardContent>
            </Card>
          </div>
        ) : accountId ? (
          <Card className="p-6 flex justify-center items-center">
            <p className="text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading forex statistics...
            </p>
          </Card>
        ) : null}

        {/* Tabs Section */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid w-auto md:w-[800px] grid-cols-2 md:grid-cols-9">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="freezeHistory">Freezes</TabsTrigger>
            {forexStats && (
              <>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="instruments">Instruments</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
                <TabsTrigger value="risk">Risk</TabsTrigger>
                <TabsTrigger value="tradeHistory">Trade History</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Standard Tabs */}
          <TabsContent value="positions">
            {openTrades && openTrades.length > 0 ? (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Open Trades</h2>
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
              </div>
            ) : null}
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

          {/* Performance Tab */}
          {forexStats && (
            <TabsContent value="performance">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Balance Growth</CardTitle>
                    <CardDescription>
                      Account balance progress over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={balanceGrowthData}>
                        <defs>
                          <linearGradient
                            id="colorBalance"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8884d8"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8884d8"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `$${(value as number).toFixed(2)}`,
                            "Balance",
                          ]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Balance"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorBalance)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                    {/* Balance Growth Table */}
                    <div className="mt-6 overflow-x-auto">
                      <h3 className="text-lg font-medium mb-2">
                        Balance History Data
                      </h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {balanceGrowthData.map(
                            (entry: any, index: number) => (
                              <tr key={index} className="border-b border-muted">
                                <td className="p-2">{entry.date}</td>
                                <td className="p-2">
                                  ${entry.Balance?.toFixed(2) || "0.00"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Performance</CardTitle>
                    <CardDescription>
                      Win/loss ratio and trade statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={winLossData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f43f5e" />
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} trades`, "Count"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Win/Loss Table */}
                      <div className="mt-4 overflow-x-auto">
                        <h3 className="text-lg font-medium mb-2">
                          Win/Loss Data
                        </h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Result</th>
                              <th className="p-2 text-left">Count</th>
                              <th className="p-2 text-left">Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {winLossData.map((result, index) => {
                              const total = winLossData.reduce(
                                (sum, item) => sum + item.value,
                                0
                              );
                              const percentage = (result.value / total) * 100;
                              return (
                                <tr
                                  key={index}
                                  className="border-b border-muted"
                                >
                                  <td className="p-2">{result.name}</td>
                                  <td className="p-2">{result.value}</td>
                                  <td className="p-2">
                                    {percentage.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-muted">
                              <td className="p-2 font-semibold">Total</td>
                              <td className="p-2 font-semibold">
                                {winLossData.reduce(
                                  (sum, item) => sum + item.value,
                                  0
                                )}
                              </td>
                              <td className="p-2 font-semibold">100%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Profit/Loss:</span>
                        <span
                          className={
                            metrics?.profit && parseFloat(metrics.profit) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          ${metrics?.profit?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Trades:</span>
                        <span>{metrics?.trades || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Win Rate:</span>
                        <span>
                          {metrics?.wonTradesPercent?.toFixed(2) || "0.00"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best Trade:</span>
                        <span className="text-green-500">
                          ${metrics?.bestTrade?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Worst Trade:</span>
                        <span className="text-red-500">
                          ${metrics?.worstTrade?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Metrics</CardTitle>
                    <CardDescription>
                      Long-term performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>CAGR:</span>
                        <span>{metrics?.cagr?.toFixed(2) || "0.00"}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Gain:</span>
                        <span>{metrics?.dailyGain?.toFixed(2) || "0.00"}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absolute Gain:</span>
                        <span>
                          {metrics?.absoluteGain?.toFixed(2) || "0.00"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Gain:</span>
                        <span>
                          {metrics?.monthlyGain?.toFixed(2) || "0.00"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum Drawdown:</span>
                        <span className="text-red-500">
                          -{metrics?.maxDrawdown?.toFixed(2) || "0.00"}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>MAR Ratio:</span>
                        <span>{metrics?.mar?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trading Days:</span>
                        <span>
                          {metrics?.daysSinceTradingStarted?.toFixed(1) ||
                            "0.0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trading Started:</span>
                        <span>
                          {metrics?.tradingStartBrokerTime
                            ? new Date(
                                metrics.tradingStartBrokerTime
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Highest Balance:</span>
                        <span>
                          ${metrics?.highestBalance?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Instruments Tab */}
          {forexStats && (
            <TabsContent value="instruments">
              <h2 className="text-xl font-semibold mb-4">
                Currency Performance
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Currency Profit Comparison</CardTitle>
                    <CardDescription>
                      Profit performance by currency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={currencyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `$${(value as number).toFixed(2)}`,
                            "Profit",
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="Profit" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Currency Profit Table */}
                    <div className="mt-6 overflow-x-auto">
                      <h3 className="text-lg font-medium mb-2">
                        Currency Profit Data
                      </h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Currency</th>
                            <th className="p-2 text-left">Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currencyData.map((currency: any, index: number) => (
                            <tr key={index} className="border-b border-muted">
                              <td className="p-2">{currency.name}</td>
                              <td
                                className={`p-2 ${
                                  currency.Profit >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                ${currency.Profit.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Timing Tab */}
          {forexStats && (
            <TabsContent value="timing">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance by Day of Week</CardTitle>
                    <CardDescription>
                      Trading results by day of the week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dayOfWeekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="day" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          yAxisId="left"
                          orientation="left"
                          tickFormatter={(value) =>
                            `$${(value as number).toFixed(2)}`
                          }
                        />
                        <YAxis
                          stroke="#888"
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) =>
                            `${(value as number).toFixed(1)}%`
                          }
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "Profit")
                              return [`$${(value as number).toFixed(2)}`, name];
                            return [`${(value as number).toFixed(1)}%`, name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Profit" fill="#3b82f6" yAxisId="left" />
                        <Bar
                          dataKey="Win Rate"
                          fill="#f59e0b"
                          yAxisId="right"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading by Day of Week</CardTitle>
                    <CardDescription>Detailed breakdown by day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Day</th>
                            <th className="p-2 text-left">Trades</th>
                            <th className="p-2 text-left">Profit</th>
                            <th className="p-2 text-left">Win Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics?.closeTradesByWeekDay?.map((day: any) => {
                            const dayNames = [
                              "Sunday",
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ];
                            return (
                              <tr
                                key={day.day}
                                className="border-b border-muted"
                              >
                                <td className="p-2">{dayNames[day.day]}</td>
                                <td className="p-2">{day.trades}</td>
                                <td
                                  className={`p-2 ${
                                    parseFloat(day.profit) >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  ${parseFloat(day.profit).toFixed(2)}
                                </td>
                                <td className="p-2">
                                  {day.wonTradesPercent?.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trading by Hour</CardTitle>
                    <CardDescription>Activity patterns by hour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="hour" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                          formatter={(value) => [`${value} trades`, "Trades"]}
                        />
                        <Legend />
                        <Bar dataKey="Trades" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Hourly Trading Table */}
                    <div className="mt-6 overflow-x-auto">
                      <h3 className="text-lg font-medium mb-2">
                        Hourly Trading Data
                      </h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Hour</th>
                            <th className="p-2 text-left">Trades</th>
                            <th className="p-2 text-left">Profit</th>
                            <th className="p-2 text-left">Win Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hourlyData.map((hour: any, index: number) => (
                            <tr key={index} className="border-b border-muted">
                              <td className="p-2">{hour.hour}</td>
                              <td className="p-2">{hour.Trades}</td>
                              <td
                                className={`p-2 ${
                                  hour.Profit >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }`}
                              >
                                ${hour.Profit.toFixed(2)}
                              </td>
                              <td className="p-2">
                                {hour["Win Rate"].toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Risk Tab */}
          {forexStats && (
            <TabsContent value="risk">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk of Ruin</CardTitle>
                    <CardDescription>
                      Probability of account loss by percentage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={riskOfRuinData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="Loss Size" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          tickFormatter={(value) => `${value.toFixed(2)}%`}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${(value as number).toFixed(4)}%`,
                            "Probability",
                          ]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Probability"
                          stroke="#f43f5e"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Risk of Ruin Table */}
                    <div className="mt-6 overflow-x-auto">
                      <h3 className="text-lg font-medium mb-2">
                        Risk of Ruin Data
                      </h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Loss Size</th>
                            <th className="p-2 text-left">Probability (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {riskOfRuinData.map((risk: any, index: number) => (
                            <tr key={index} className="border-b border-muted">
                              <td className="p-2">{risk["Loss Size"]}</td>
                              <td className="p-2">
                                {risk.Probability.toFixed(4)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trade Duration Analysis</CardTitle>
                    <CardDescription>
                      Performance by holding period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={durationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                        <XAxis dataKey="Duration" stroke="#888" />
                        <YAxis
                          stroke="#888"
                          yAxisId="left"
                          orientation="left"
                          tickFormatter={(value) =>
                            `$${(value as number).toFixed(2)}`
                          }
                        />
                        <YAxis
                          stroke="#888"
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) =>
                            `${(value as number).toFixed(1)}%`
                          }
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "Trades")
                              return [
                                `${Math.round(value as number)} trades`,
                                name,
                              ];
                            return [`${(value as number).toFixed(1)}%`, name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Trades" fill="#8b5cf6" yAxisId="left" />
                        <Bar
                          dataKey="Win Rate"
                          fill="#10b981"
                          yAxisId="right"
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Trade Duration Table */}
                    <div className="mt-6 overflow-x-auto">
                      <h3 className="text-lg font-medium mb-2">
                        Trade Duration Data
                      </h3>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="p-2 text-left">Duration</th>
                            <th className="p-2 text-left">Trades</th>
                            <th className="p-2 text-left">Win Rate (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {durationData.map((duration: any, index: number) => (
                            <tr key={index} className="border-b border-muted">
                              <td className="p-2">{duration.Duration}</td>
                              <td className="p-2">
                                {Math.round(duration.Trades)}
                              </td>
                              <td className="p-2">
                                {duration["Win Rate"].toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Trade History Tab */}
          {forexStats && (
            <TabsContent value="tradeHistory">
              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>
                    Historical record of all completed trades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forexStats.trades && forexStats.trades.length > 0 ? (
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
                          </tr>
                        </thead>
                        <tbody>
                          {forexStats.trades.map(
                            (trade: any, index: number) => (
                              <tr
                                key={trade._id || index}
                                className="border-b border-muted"
                              >
                                <td className="p-2">{trade?.symbol || ""}</td>
                                <td className="p-2">
                                  {trade?.type === "POSITION_TYPE_BUY" ||
                                  trade?.type === "BUY"
                                    ? "BUY"
                                    : "SELL"}
                                </td>
                                <td className="p-2">{trade?.volume || 0}</td>
                                <td className="p-2">{trade?.openPrice || 0}</td>
                                <td className="p-2">
                                  {trade?.closePrice || 0}
                                </td>
                                <td
                                  className={`p-2 ${
                                    trade?.profit &&
                                    parseFloat(trade.profit) >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {trade?.profit &&
                                  parseFloat(trade.profit) >= 0
                                    ? "+"
                                    : ""}
                                  {trade?.profit || "0.00"}
                                </td>
                                <td className="p-2">{trade?.pips || 0}</td>
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
                              </tr>
                            )
                          )}
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
          )}
        </Tabs>
      </div>
    );
  }

  return null;
};

export default UserPage;
