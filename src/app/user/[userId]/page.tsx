"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { forexApi } from "@/hooks/useAxios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Positions from "@/components/account/positions";
import { UserData } from "@/types";
import Deals from "@/components/account/deals";
import Orders from "@/components/account/orders";
import FreezeHistory from "@/components/account/freezeHistory";

const UserPage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await forexApi.get(`account/user/${userId}`);
        setUserData(response.data);
        setIsLoading(false);
        //@ts-ignore
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
        setIsLoading(false);
      }
    };
    fetchUser();
    const pollingInterval = setInterval(() => {
      fetchUser();
    }, 2000);

    return () => clearInterval(pollingInterval);
  }, [userId]);

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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userData) {
    const { account } = userData;
    const profitClass =
      parseFloat(account.profitLoss.toFixed(2)) >= 0
        ? "text-green-500"
        : "text-red-500";

    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="icon"
                className="mr-2"
              >
                <ChevronLeft className="" />
              </Button>
              User Profile
            </CardTitle>
            <CardDescription>Account details and performance</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                User
              </h3>
              <p className="text-lg font-semibold">
                {account.firstName} {account.lastName}
              </p>
              <p className="text-sm">{account.email}</p>
              <p className="text-sm">Phone: {account.phonenumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Account
              </h3>
              <p className="text-lg font-semibold">{account.name}</p>
              <p className="text-sm">ID: {account.accountId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Performance
              </h3>
              <p className="text-lg font-semibold">
                Trade Count: {account.tradeCount}
              </p>
              <p className={`text-lg font-semibold ${profitClass}`}>
                Profit/Loss: {account.profitLoss?.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${account.balance?.toFixed(2)}
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
                ${account.equity?.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                P/L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${profitClass}`}>
                {account.pnlPercentage >= 0 ? "+" : ""}
                {account.pnlPercentage?.toFixed(2)}%
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
              <p className="text-2xl font-bold">{account.freezeCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="positions" className="w-full">
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="freezeHistory">Freeze History</TabsTrigger>
          </TabsList>

          {/* Positions Tab */}
          <TabsContent value="positions">
            <Positions account={account} />
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals">
            <Deals account={account} />
          </TabsContent>

          <TabsContent value="orders">
            <Orders account={account} />
          </TabsContent>

          {/* Freeze History Tab */}
          <TabsContent value="freezeHistory">
            <FreezeHistory account={account} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return null;
};

export default UserPage;
