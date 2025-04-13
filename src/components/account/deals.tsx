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
import { Account, Deal } from "@/types";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString();
};

const Deals = ({ account }: { account: Account }) => {
  // Filter out duplicate deals and reverse the order
  const processedDeals = useMemo(() => {
    if (!account.deals || account.deals.length === 0) return [];

    // Group deals by symbol, type, and timestamp for better deduplication
    const dealsMap = new Map<string, Deal[]>();

    // First sort by time to ensure we keep the latest deal for each group
    const sortedDeals = [...account.deals].sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA; // Descending (newest first)
    });

    // First pass: group by time+symbol+type+volume
    sortedDeals.forEach((deal) => {
      if (!deal.time) return;

      // Create a composite key using timestamp, symbol, type, and volume
      const timeKey = deal.time.split("T")[0]; // Just use the date part to group by day
      const symbol = deal.symbol || "";
      const type = deal.type || "";
      const volume = deal.volume?.toString() || "";

      const groupKey = `${timeKey}|${symbol}|${type}|${volume}`;

      if (!dealsMap.has(groupKey)) {
        dealsMap.set(groupKey, []);
      }

      dealsMap.get(groupKey)?.push(deal);
    });

    // Second pass: for each group, keep only one deal (highest profit by default)
    const uniqueDeals: Deal[] = [];

    // Use Array.from to convert the map entries to an array we can iterate
    Array.from(dealsMap.entries()).forEach(([_key, deals]) => {
      console.log(_key);
      if (!deals || deals.length === 0) return;

      // If multiple deals in a group, keep the one with highest profit
      if (deals.length > 1) {
        deals.sort((a: Deal, b: Deal) => (b.profit || 0) - (a.profit || 0));
      }

      // Add the first deal from each group
      uniqueDeals.push(deals[0]);
    });

    // Final sort by timestamp
    return uniqueDeals.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0;
      const timeB = b.time ? new Date(b.time).getTime() : 0;
      return timeB - timeA; // Descending (newest first)
    });
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
                <TableHead>Time</TableHead>
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
                    <TableCell>{formatDate(deal.time)}</TableCell>
                    <TableCell>{deal.symbol || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deal.type === "DEAL_TYPE_BUY"
                            ? "default"
                            : deal.type === "DEAL_TYPE_SELL"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {deal.type === "DEAL_TYPE_BUY"
                          ? "BUY"
                          : deal.type === "DEAL_TYPE_SELL"
                          ? "SELL"
                          : deal.type.replace("DEAL_TYPE_", "")}
                      </Badge>
                    </TableCell>
                    <TableCell>{deal.entryPrice || "-"}</TableCell>
                    <TableCell>{deal.closePrice || "-"}</TableCell>
                    <TableCell>{deal.volume || "-"}</TableCell>
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
