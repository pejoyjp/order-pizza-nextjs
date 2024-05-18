"use server"
import executeQuery from "@/lib/db"
import Stripe from 'stripe'
const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY}`);

export const savePayment = async (data) => {

  const {
    userId,
    instruction,
    paymentStatus,
    totalPrice,
    status,
    paymentMethod,
    deliveryAddress,
    contactPhone,
    deliveryMethod
  } = data

  const query = `
      INSERT INTO orders (user_id, total_price, status, created_at, updated_at, delivery_address, contact_phone, payment_method, payment_status, special_instructions,delivery_method)
      VALUES (?, ?, ?, current_timestamp(), current_timestamp(), ?, ?, ?, ?, ?,?)
  `;
  const arrParams = [ 
                      userId,
                      totalPrice,
                      status,
                      deliveryAddress,
                      contactPhone,
                      paymentMethod,
                      paymentStatus,
                      instruction,
                      deliveryMethod
                    ];

  try {
      const result = await executeQuery(query, arrParams);

  
      const orderId = result.insertId;
      console.log(orderId);

      return {
        success: true,
        message: "Pay successfully",
        orderId: orderId,
      };
    
  } catch (error) {
      return {
        success: false,
        message: "Failed to get contacts",
        error: error
      };
  }
};




export async function verifytPayment(amount) {
  console.log(amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "USD",
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    return { error: error.message };
  }
}