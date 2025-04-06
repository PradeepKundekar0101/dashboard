import React from "react";
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
import { Account, Position } from "@/types";

const Positions = ({ account }: { account: Account }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
        <CardDescription>Active trades in the market</CardDescription>
      </CardHeader>
      <CardContent>
        {account.positions && account.positions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Open Price</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>P/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {account.positions.map((position: Position) => {
                const profitClass =
                  position.profit >= 0 ? "text-green-500" : "text-red-500";
                return (
                  <TableRow key={position.id}>
                    <TableCell>{position.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          position.type === "POSITION_TYPE_BUY"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {position.type === "POSITION_TYPE_BUY" ? "BUY" : "SELL"}
                      </Badge>
                    </TableCell>
                    <TableCell>{position.openPrice}</TableCell>
                    <TableCell>{position.currentPrice}</TableCell>
                    <TableCell>{position.volume}</TableCell>
                    <TableCell className={profitClass}>
                      {position.profit >= 0 ? "+" : ""}
                      {position.profit?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p>No open positions</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Positions;
