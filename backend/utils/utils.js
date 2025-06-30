const pool = require('../config/database');

const isOneDayPriorToToday = async (date) => {
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0); // Set time to midnight

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Subtract one day
    yesterday.setHours(0, 0, 0, 0); // Set time to midnight

    return await inputDate.getTime() === yesterday.getTime();
}



const isSameDay = async (date) => {
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0); // Set time to midnight
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight
    
    return await inputDate.getTime() === today.getTime();
}

const getUserTopRange = async(userId) => {
    try {
        // 1. Get the user's score
        const userScoreResult = await pool.query('SELECT ib_points FROM users WHERE id = $1', [userId]);
        if (userScoreResult.rows.length === 0) {
            return { error: 'User not found' };
        }
        const userScore = userScoreResult.rows[0].ib_points;

        // 2. Get all scores, order them descending
        const allScoresResult = await pool.query('SELECT ib_points FROM users ORDER BY ib_points DESC');
        const allScores = allScoresResult.rows.map(row => row.ib_points);

        // 3. Find the user's rank
        const userRank = allScores.indexOf(userScore) + 1;  // +1 because array index starts from 0

        // 4. Calculate top percentage range
        const totalUsers = allScores.length;
        const topPercentage = (userRank / totalUsers) * 100;

        let topRange;
        if (topPercentage <= 1) {
            topRange = 'Top 1%';
        } else if (topPercentage <= 5) {
            topRange = 'Top 5%';
        } else if (topPercentage <= 10) {
            topRange = 'Top 10%';
        } else if (topPercentage <= 25) {
            topRange = 'Top 25%';
        } else if (topPercentage <= 50) {
            topRange = 'Top 50%';
        } else if (topPercentage <= 75) {
            topRange = 'Top 75%';
        } else if (topPercentage <= 90) {
            topRange = 'Top 90%';
        } else {
            topRange = 'Top 100%';
        }

        return { score: userScore, topRange: topRange };

    } catch (error) {
        console.error('Error calculating top range:', error);
        return { error: 'Failed to calculate top range' };
    }

}

module.exports = {isOneDayPriorToToday, isSameDay, getUserTopRange};