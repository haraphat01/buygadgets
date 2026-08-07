import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Package,
  PackageX,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { SalesChart } from "@/components/admin/dashboard/sales-chart";
import { getDashboardStats } from "@/services/dashboard";
import { formatNaira } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const {
    productCount,
    lowStockCount,
    outOfStockCount,
    customerCount,
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    recentOrders,
    salesChart,
  } = await getDashboardStats();

  const stats: { label: string; icon: React.ComponentType<{ className?: string }>; value: string | number }[] = [
    { label: "Revenue", icon: Wallet, value: formatNaira(totalRevenue) },
    { label: "Orders", icon: ShoppingCart, value: totalOrders },
    { label: "Pending Orders", icon: Clock, value: pendingOrders },
    { label: "Delivered Orders", icon: CheckCircle2, value: deliveredOrders },
    { label: "Cancelled Orders", icon: Ban, value: cancelledOrders },
    { label: "Products", icon: Package, value: productCount },
    { label: "Customers", icon: Users, value: customerCount },
    { label: "Low Stock", icon: AlertTriangle, value: lowStockCount },
    { label: "Out of Stock", icon: PackageX, value: outOfStockCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>The 5 most recently placed orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {order.firstName} {order.lastName}
                      </TableCell>
                      <TableCell>{formatNaira(Number(order.total))}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-muted-foreground" />
              Stock Alerts
            </CardTitle>
            <CardDescription>Low stock and out-of-stock items.</CardDescription>
          </CardHeader>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            {lowStockCount + outOfStockCount === 0 ? (
              <p>All products are well stocked.</p>
            ) : (
              <p className="text-center">
                {lowStockCount} low stock · {outOfStockCount} out of stock
              </p>
            )}
            <Button variant="outline" size="sm" render={<Link href="/admin/inventory" />}>
              View Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales</CardTitle>
          <CardDescription>Revenue from paid and fulfilled orders, last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {salesChart.every((d) => d.revenue === 0) ? (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              No sales data yet
            </div>
          ) : (
            <SalesChart data={salesChart} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
