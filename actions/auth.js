"use server"
import executeQuery from "@/lib/db";
import bcrypt from 'bcrypt';


export const registerUser = async (data) => {
    console.log(data);
    const { name, email, password, avatar,role } = data;
    const saltRounds = 10;

    try {

        const hashedPassword = await bcrypt.hash(password, saltRounds);
 
        const sql = `
            INSERT INTO users (username, email, hashed_password, avatar_url,role)
            VALUES (?, ?, ?, ?,?)
        `;

        const params = [name, email, hashedPassword, avatar,role];

        const result = await executeQuery(sql, params);
        console.log('User registered successfully:', result);
  
        return { success: true,message:'User registered successfully'};
    } catch (error) {
        console.error('Registration failed:', error);
        throw new Error('Failed to register user');
    }
}


export const loginUser = async (data) => {
    const { email, password } = data;

    try {
        const sql = "SELECT id, email, hashed_password FROM users WHERE email = ?";
        const params = [email];
        const results = await executeQuery(sql, params);

        if (results.length === 0) {
            return { success: false, message: "User not found." };
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.hashed_password);

        if (isMatch) {
            // Generate JWT
         
            return {
                success: true,
                message: "Login successful.",
                userId: user.id,
               
            };
        } else {
            return { success: false, message: "Invalid credentials." };
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Login failed due to server error');
    }
}