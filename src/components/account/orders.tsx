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
const Orders = ({ account }: { account: Account }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Orders</CardTitle>
        <CardDescription>Orders waiting to be executed</CardDescription>
      </CardHeader>
      <CardContent>
        {account.orders && account.orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {account.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.symbol}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.type.includes("BUY") ? "default" : "destructive"
                      }
                    >
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{order.volume}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No pending orders</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Orders;
