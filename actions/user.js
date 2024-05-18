"use server"
import executeQuery from "@/lib/db";

export const getUserByUserId = async (userId) => {
    // Define the SQL query to fetch the user by ID
    const sql = "SELECT * FROM users WHERE id = ?";
    const params = [userId]; // Parameters to prevent SQL injection

    try {
        // Execute the SQL query
        const results = await executeQuery(sql, params);
        
        // Check if a user was found
        if (results.length > 0) {
            // Return the first user found (there should only be one user with a unique ID)
            return { success: true, user: results[0] };
        } else {
            // No user found with the given ID
            return { success: false, message: "User not found." };
        }
    } catch (error) {
        // Log and throw any errors encountered during the query
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user due to server error');
    }
}


export const uploadContactByUserId = async (userId, data) => {
    const { address, phoneNumber } = data;

    // SQL插入语句，将用户的地址和电话号码插入到user_contacts表中
    const insertQuery = `INSERT INTO user_contacts (user_id, address, phone_number) VALUES (?, ?, ?)`;

    try {
        // 执行SQL插入语句
        const result = await executeQuery(insertQuery, [userId, address, phoneNumber]);
        
        // 返回成功的结果
        return {
            success: true,
            message: "Contact uploaded successfully",
            contactId: result.insertId // 获取插入行的ID
        };
    } catch (error) {
        console.error('Failed to upload contact:', error);
        return {
            success: false,
            message: "Failed to upload contact",
            error: error
        };
    }
}

export const getContactsByUserId = async (userId) => {
    // SQL查询语句，获取特定用户的联系信息
    const selectQuery = `SELECT id, address, phone_number FROM user_contacts WHERE user_id = ?`;

    try {
        // 执行SQL查询语句
        const results = await executeQuery(selectQuery, [userId]);

        // 返回成功的结果
        return {
            success: true,
            data: results // 返回联系信息结果集
        };
    } catch (error) {
        console.error('Failed to get contacts:', error);
        return {
            success: false,
            message: "Failed to get contacts",
            error: error
        };
    }
}

export const deleteContactByUserIdAndContactId = async (userId, contactId) => {
    // SQL删除语句，删除特定用户的特定联系信息
    const deleteQuery = `DELETE FROM user_contacts WHERE user_id = ? AND id = ?`;

    try {
        // 执行SQL删除语句
        await executeQuery(deleteQuery, [userId, contactId]);
        
        // 返回成功的结果
        return {
            success: true,
            message: "Contact deleted successfully"
        };
    } catch (error) {
        console.error('Failed to delete contact:', error);
        return {
            success: false,
            message: "Failed to delete contact",
            error: error
        };
    }
}