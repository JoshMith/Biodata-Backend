import pool from "../../config/db.config";

export const generateRegistrationNumber = async (user_id: number): Promise<string> => {
  try {
    // Get parish_id from user
    const [userRows] = await pool.query(
      "SELECT parish_id FROM users WHERE id = ?",
      [user_id]
    );

    if (!userRows || (userRows as any[]).length === 0) {
      throw new Error("User not found");
    }

    const parish_id = (userRows as any[])[0].parish_id;

    // Get parish name
    const [parishRows] = await pool.query(
      "SELECT parish_name FROM parishes WHERE parish_id = ?",
      [parish_id]
    );

    if (!parishRows || (parishRows as any[]).length === 0) {
      throw new Error("Parish not found");
    }

    const parishName = (parishRows as any[])[0].parish_name;
    const initials = parishName.split(' ').map((word: string) => word.charAt(0).toUpperCase()).join('');

    // Get the next sequential number for this parish
    const [countRows] = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE parish_id = ?",
      [parish_id]
    );

    const count = (countRows as any[])[0].count + 1;

    // Format as initials followed by 3-digit number (e.g., KMK002)
    const regNum = `${initials}${count.toString().padStart(3, '0')}`;

    return regNum;
  } catch (error) {
    console.error("Error generating registration number:", error);
    throw error;
  }
};