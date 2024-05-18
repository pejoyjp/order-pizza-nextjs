"use server"
import executeQuery from "@/lib/db";

export const uploadFeedback = async (data) => {
    // Extract email, feedbackText, name from the data object
    const { email, feedback, name } = data;

    try {
        // Define the SQL query to insert feedback data into the Feedback table
        const sql = `
            INSERT INTO Feedback (email, feedback_text, name)
            VALUES (?, ?, ?)
        `;
        
        // Execute the SQL query, passing email, feedbackText, name as parameters
        await executeQuery(sql, [email, feedback, name]);

        // Return the result
        return {
            success: true,
            message: "uploaded successfully!",
        };
    } catch (error) {
        // Handle any errors
        console.error("Error uploading feedback:", error);
        throw new Error("Failed to upload feedback");
    }
};


export const getAllFeedback = async () => {
    try {
        // Define the SQL query to select all feedback from the Feedback table
        const sql = `
            SELECT * FROM Feedback
        `;
        
        // Execute the SQL query
        const result = await executeQuery(sql);

        // Return the result
        return {
            success: true,
            message: "uploaded successfully!",
            res:result
        };
    } catch (error) {
        // Handle any errors
        console.error("Error fetching feedback:", error);
        throw new Error("Failed to fetch feedback");
    }
};



