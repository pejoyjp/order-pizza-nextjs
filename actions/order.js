"use server"
import executeQuery from "@/lib/db";

export const createOrderByUserId = async (userId, items, totalPrice, additionalDetails) => {
    // Start a database transaction
    await executeQuery('START TRANSACTION');

    try {
        // Insert the main order details into the orders table
        const orderQuery = `
            INSERT INTO orders (user_id, total_price, status, delivery_address, contact_phone, created_at)
            VALUES (?, ?, 'Pending', ?, ?, NOW())
        `;
        const orderParams = [userId, totalPrice, additionalDetails.deliveryAddress, additionalDetails.contactPhone];
        const orderResult = await executeQuery(orderQuery, orderParams);
        const orderId = orderResult.insertId;

        // Insert each item into the order_pizzas table
        for (const item of items) {
            const itemQuery = `
                INSERT INTO order_pizzas (order_id, pizza_id, quantity, size, price, customizations)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const itemParams = [orderId, item.pizza_id, item.quantity, item.size, item.price, JSON.stringify(item.customizations)];
            await executeQuery(itemQuery, itemParams);
        }

        // Commit the transaction
        await executeQuery('COMMIT');
        console.log('Order and order details saved:', orderId);
        return {
            success: true,
            message: "Order saved successfully!",
            orderId: orderId
        };
    } catch (error) {
        // Roll back the transaction in case of an error
        await executeQuery('ROLLBACK');
        console.error('Error saving order:', error);
        return {
            success: false,
            message: "Failed to save order",
            error: error
        };
    }
};

export const updateOrderStatus = async (orderId, newStatus) => {
    // SQL query to update the status of an order based on its ID
    const query = `
        UPDATE orders
        SET status = ?
        WHERE id = ?
    `;
    const params = [newStatus, orderId]; // Parameters to bind to the query

    try {
        const result = await executeQuery(query, params);
        if (result.affectedRows === 0) {
            console.log('No order found with the specified ID:', orderId);
            return {
                success: false,
                message: "No order found with the specified ID."
            };
        }
        console.log('Order status updated:', result);
        return {
            success: true,
            message: "Order status updated successfully!"
        };
    } catch (error) {
        console.error('Error updating order status:', error);
        return {
            success: false,
            message: "Failed to update order status",
            error: error
        };
    }
};



export const getOrdersByUserid = async (userId) => {
    const query = `
        SELECT *
        FROM orders
        WHERE user_id = ?
    `;
    const params = [userId]; // Parameters to bind to the query

    try {
        const orders = await executeQuery(query, params);
        return {
            success: true,
            orders: orders
        };
    } catch (error) {
        console.error('Error fetching orders by user ID:', error);
        return {
            success: false,
            message: "Failed to fetch orders by user ID",
            error: error
        };
    }
};


export const getLatestOrderByUserId = async (userId) => {
    // SQL query to fetch the latest order by user ID
    const query = `
        SELECT *
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;
    const params = [userId]; // Parameters to bind to the query

    try {
        const latestOrder = await executeQuery(query, params);
        if (latestOrder.length === 0) {
            console.log('No orders found for the user with ID:', userId);
            return {
                success: false,
                message: "No orders found for the user with the specified ID."
            };
        }
        return {
            success: true,
            latestOrder: latestOrder[0]
        };
    } catch (error) {
        console.error('Error fetching the latest order by user ID:', error);
        return {
            success: false,
            message: "Failed to fetch the latest order by user ID",
            error: error
        };
    }
};


export const getOrderByUserIdAndOrderId = async (userId, orderId) => {
    const query = `SELECT * FROM orders WHERE user_id = ? AND id = ?`;
    const params = [userId, orderId];

    try {
        const result = await executeQuery(query, params);
        if (result.length === 0) {
            console.log('No order found with the specified user ID and order ID:', userId, orderId);
            return {
                success: false,
                message: "No order found with the specified user ID and order ID."
            };
        }
        console.log('Order details retrieved:', result[0]);
        return {
            success: true,
            message: "Order details retrieved successfully!",
            order: result[0]
        };
    } catch (error) {
        console.error('Error retrieving order details:', error);
        return {
            success: false,
            message: "Failed to retrieve order details",
            error: error
        };
    }
};

export const saveOrderPizzas = async (orderId,carts) => {
    try {
      // 遍历购物车中的每个项，并将其插入到数据库中
      for (const cartItem of carts) {
        const { id: pizzaId, quantity, sizeandcrust: size, price,toppings} = cartItem;
        
        // 将订单数据插入到数据库中的order_pizzas表中
        const query = `
          INSERT INTO order_pizzas (order_id, pizza_id, quantity, size, price,toppings)
          VALUES (?, ?, ?, ?, ?,?)
        `;
        const params = [orderId, pizzaId, quantity, size, price,JSON.stringify(toppings)];
        await executeQuery(query, params);
      }
      
      return { success: true, message: "Order pizzas saved successfully!" };
    } catch (error) {
      console.error('Error saving order pizzas:', error);
      return { success: false, message: "Failed to save order pizzas", error: error };
    }
};


export const updateOrder = async (data) => {
    const {orderId, riderId, status} = data
    console.log(data);

  

    try {

      const riderExists = await checkRiderExists(orderId);
      if (riderExists) {
        return { success: false, message: "order already has been token" };
      }
  

      const query = `
        UPDATE orders
        SET rider_id = ?, status = ?
        WHERE id = ?
      `;
 
      const params = [riderId, status, orderId];

      await executeQuery(query, params);
  
      return { success: true, message: "Order updated successfully!" };
    } catch (error) {

      return { success: false, message: "Failed to update order status", error: error };
    }
};
  

const checkRiderExists = async ( orderId) => {
    try {
        const query = `
            SELECT rider_id
            FROM orders
            WHERE id = ? AND rider_id IS NOT NULL
        `;
        const [rows] = await executeQuery(query, [orderId]);
        return rows.length > 0; 
    } catch (error) {
        console.error("Error checking rider existence:", error);
        return false; 
    }
};



export const getOrdersByRiderId = async (riderId) => {
    try {

      const query = `
        SELECT *
        FROM orders
        WHERE rider_id = ? AND status = 'deliverying'
      `;

      const params = [riderId];
      
  
      const orders = await executeQuery(query, params);
  
      
      return { success: true, orders: orders };
    } catch (error) {
    
      return { success: false, message: "Failed to get orders by riderId", error: error };
    }
};


export const completeOrder = async (orderId) => {
    try {
        const query = `
            UPDATE orders
            SET status = 'completed'
            WHERE id = ?
        `;
        const result = await executeQuery(query, [orderId]);
        
        if (result.affectedRows === 0) {
            throw new Error("Order not found");
        }
        
        return { success: true, message: "Order completed successfully" };
    } catch (error) {
        return { success: false, message: "Failed to complete order", error: error };
    }
};



export const getCompletedOrdersByRiderId = async (riderId) => {
    try {
        // 执行 SQL 查询已完成的订单
        const query = `
            SELECT *
            FROM orders
            WHERE rider_id = ? AND status = 'completed'
        `;
        const completedOrders = await executeQuery(query, [riderId]);
        
        return { success: true, completedOrders: completedOrders };
    } catch (error) {
        return { success: false, message: "Failed to get completed orders by riderId", error: error };
    }
};



export const getAllOrders = async () => {
    try {
        const query = `
            SELECT * FROM orders
        `;
        const orders = await executeQuery(query);
        return { success: true, orders: orders };
    } catch (error) {
        return { success: false, message: "Failed to get all orders", error: error };
    }
};



export const getOrderPizzasByOrderId = async (orderId) => {
    try {
        const query = `
            SELECT * FROM order_pizzas
            WHERE order_id = ?
        `;

        const params = [orderId];
        const orders_pizzas = await executeQuery(query, params);

        return { success: true, orderPizzas: orders_pizzas };
    } catch (error) {
        return { success: false, message: "Failed to get order pizzas", error: error };
    }
};



export const getAllOrderPizzasByOrderId = async () => {
    try {
        const query = `
            SELECT * FROM order_pizzas

        `;

  
        const orders_pizzas = await executeQuery(query);

        return { success: true, data: orders_pizzas };
    } catch (error) {
        return { success: false, message: "Failed to get order pizzas", error: error };
    }
};

