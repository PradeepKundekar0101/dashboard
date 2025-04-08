import React, { useMemo } from "react";

import { TableCell } from "../ui/table";
import { TableBody } from "../ui/table";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Table, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Account } from "@/types";
const Deals = ({ account }: { account: Account }) => {
  // Filter out duplicate deals and reverse the order
  const processedDeals = useMemo(() => {
    if (!account.deals || account.deals.length === 0) return [];

    // Use a Set to track unique deal signatures
    const uniqueDeals = new Map();

    account.deals.forEach((deal) => {
      // Create a signature based on all relevant deal properties
      const signature = `${deal.symbol}-${deal.type}-${deal.entryPrice}-${deal.closePrice}-${deal.volume}-${deal.profit}`;

      // Only keep the first occurrence of each unique deal
      if (!uniqueDeals.has(signature)) {
        uniqueDeals.set(signature, deal);
      }
    });

    // Convert back to array and reverse the order
    return Array.from(uniqueDeals.values()).reverse();
  }, [account.deals]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Closed Deals</CardTitle>
        <CardDescription>History of completed trades</CardDescription>
      </CardHeader>
      <CardContent>
        {processedDeals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Close Price</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedDeals.map((deal) => {
                const profitClass =
                  deal.profit >= 0 ? "text-green-500" : "text-red-500";
                return (
                  <TableRow key={deal.id}>
                    <TableCell>{deal.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deal.type === "DEAL_TYPE_BUY"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {deal.type === "DEAL_TYPE_BUY" ? "BUY" : "SELL"}
                      </Badge>
                    </TableCell>
                    <TableCell>{deal.entryPrice}</TableCell>
                    <TableCell>{deal.closePrice}</TableCell>
                    <TableCell>{deal.volume}</TableCell>
                    <TableCell className={profitClass}>
                      {deal.profit >= 0 ? "+" : ""}
                      {deal.profit?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p>No closed deals</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Deals;
