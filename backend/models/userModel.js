const pool = require('../config/database');

const getAllUsers = async () => {
    try {
        const result = await pool.query('SELECT * FROM users');
        return result.rows;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

const getUserById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

const createUser = async (user) => {
    const { username, email, university, password } = user;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, university, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [username, email, university, password]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

const updateUser = async (id, user) => {
    const { username, email, university, password } = user;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, university = $3, password = $4 WHERE id = $5 RETURNING *',
            [username, email, university, password, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

const deleteUser = async (id) => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
