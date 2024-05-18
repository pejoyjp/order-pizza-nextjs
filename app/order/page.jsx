"use client"
import React from 'react';
import useSWR from 'swr';
import useUserId from '@/hooks/userUserId';
import { getOrdersByUserid } from '@/actions/order';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Order = () => {
  const { userId } = useUserId();
  const route = useRouter();
  const { data, isLoading } = useSWR(`Order${userId}`, () => getOrdersByUserid(userId));

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // 按照最新时间排序订单
  const sortedOrders = data?.orders?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  return (
    <div className='min-h-screen'>
      <Table>
        <TableHeader>
          <TableHead>Status</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Delivery Method</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Total Price</TableHead>
          <TableHead>Time</TableHead>
        </TableHeader>
        <TableBody>
          {sortedOrders?.map((order) => (
            <TableRow
              key={order.id}
              onClick={() => route.push(`/order/order?orderId=${order.id}`)}
              className="cursor-pointer"
            >
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.payment_method}</TableCell>
              <TableCell>{order.delivery_method}</TableCell>
              <TableCell>{order.delivery_address}</TableCell>
              <TableCell>${order.total_price}</TableCell>
              <TableCell>{format(new Date(order.updated_at), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Order;
