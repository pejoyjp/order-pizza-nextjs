"use server"
import executeQuery from "@/lib/db"

export const getAllPizzas = async()=>{
    const sql = 'select * from pizzas'
    const data = await executeQuery(sql, '')
    return data

}


export const getPopularPizzas = async()=>{
    const sql = 'SELECT * FROM pizzas WHERE is_popular = TRUE;'
    const data = await executeQuery(sql, '')
    
    return data

}


export const getPizzaById = async (id) => {
    const sql = 'SELECT * FROM pizzas WHERE id = ?';  // SQL query with a placeholder for the ID

    try {
        const result = await executeQuery(sql, [id]);  // Execute the query with the ID as a parameter
        if (result.length > 0) {
            return {
                success: true,
                data: result[0],
                message: "Pizza retrieved successfully."
            };
        } else {
            return {
                success: false,
                message: "No pizza found with the given ID."
            };
        }
    } catch (error) {
        console.error('Error in getAllPizzaById:', error);
        return {
            success: false,
            error: error,
            message: "Failed to retrieve pizza."
        };
    }
}


export const getToppingsByPizzaId = async (pizzaId) => {
    const sql = `
        SELECT t.name, pt.quantity, t.price, t.is_veg
        FROM toppings t
        LEFT JOIN pizza_toppings pt ON t.id = pt.topping_id AND pt.pizza_id = ?
    `;
    
    try {
        const result = await executeQuery(sql, [pizzaId]);  // Execute the query with the pizza ID as a parameter
        const toppings = result.map(row => ({
            name: row.name,
            quantity: row.quantity || 0,  // If quantity is null, set it to 0
            price: row.price,
            isVeg: row.is_veg,
            total_price: (row.quantity || 0) * row.price  // Calculate the total price for each topping
        }));  
        return {
            success: true,
            data: toppings,
            message: "Toppings retrieved successfully."
        };
    } catch (error) {
        console.error('Error in getToppingsByPizzaId:', error);
        return {
            success: false,
            error: error,
            message: "Failed to retrieve toppings."
        };
    }
}




export const addANewPizza = async (pizzaData) => {
    const { name, veg, price, description, img, popular, inch9, inch12 } = pizzaData;
    const sql = `
        INSERT INTO pizzas (name, veg, price, description, quantity, img, is_popular, sizeandcrust)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const sizeJson = {"M": {"price": price}, "L": {"price": inch9}, "XL": {"price": inch12}};
    const sizeAndCrustString = JSON.stringify(sizeJson);

    try {
        const result = await executeQuery(sql, [name, veg, price, description, 1, img, popular, sizeAndCrustString]);
        return {
            success: true,
            data: result.insertId,
            message: "Pizza added successfully."
        };
    } catch (error) {
        console.error('Error in addANewPizza:', error);
        return {
            success: false,
            error: error,
            message: "Failed to add pizza."
        };
    }
}


export const deletePizzaByPizzaId = async (pizzaId) => {
    const sql = `
        DELETE FROM pizzas
        WHERE id = ?
    `;

    try {
        const result = await executeQuery(sql, [pizzaId]);
        if (result.affectedRows > 0) {
            return {
                success: true,
                message: `Pizza with ID ${pizzaId} deleted successfully.`
            };
        } else {
            return {
                success: false,
                message: `Pizza with ID ${pizzaId} not found.`
            };
        }
    } catch (error) {
        console.error('Error in deletePizzaByPizzaId:', error);
        return {
            success: false,
            error: error,
            message: "Failed to delete pizza."
        };
    }
}

export const updatePizzaByPizzaId = async (pizzaId, updatedPizzaData) => {
    const { name, veg, price, description, img, popular, inch9, inch12 } = updatedPizzaData;
    const sql = `
        UPDATE pizzas
        SET name = ?, veg = ?, price = ?, description = ?, img = ?, is_popular = ?, sizeandcrust = ?
        WHERE id = ?
    `;

    const sizeJson = {"M": {"price": price}, "L": {"price": inch9}, "XL": {"price": inch12}};
    const sizeAndCrustString = JSON.stringify(sizeJson);

    try {
        const result = await executeQuery(sql, [name, veg, price, description, img, popular, sizeAndCrustString, pizzaId]);
        if (result.affectedRows > 0) {
            return {
                success: true,
                message: `Pizza with ID ${pizzaId} updated successfully.`
            };
        } else {
            return {
                success: false,
                message: `Pizza with ID ${pizzaId} not found.`
            };
        }
    } catch (error) {
        console.error('Error in updatePizzaByPizzaId:', error);
        return {
            success: false,
            error: error,
            message: "Failed to update pizza."
        };
    }
}
