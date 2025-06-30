const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const pool = require('../config/database');
const { getUsers, updateUser, createUser, deleteUser } = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {isOneDayPriorToToday, isSameDay, getUserTopRange} = require('../utils/utils');
const {v4: uuidv4} = require('uuid');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const { log } = require('console');
const _ = require('lodash');
const { google } = require('googleapis');


dotenv.config();
router.use(cookieParser()); // Use cookie-parser middleware


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
console.log(JWT_EXPIRATION)


router.get('/', (req, res) => {
    res.send("✅ Landing Page Successful!!");
});

router.post('/signup', async (req, res) => {
    try {
        const {username, email, university, password} = req.body;
        if (email === "" || password=== "" || username === "") {
            console.error("Email not found")
            return res.status(401).json({ error: 'Request body is empty' });
        }
        console.log("Sign Up Data Received!!", req.body);
        
        // Check if the user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log("User already exists!!", existingUser.rows[0]);
            return res.status(400).json({ error: 'User already exists. Please log in.' });
        }
        console.log("User does not exist!! Proceeding to create a new user!!");
        
        const hashedPassword = await hashPassword(password);
        const newUser = await createUser({ username, email, university, password: hashedPassword });

        // Generate JWT token
        const tokenPayload = { id: newUser.id, email: newUser.email };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        // await sendVerificationEmail(email, verificationToken);
        // alert("Verification email sent successfully to:", email);

        // Clear all other cookies
        Object.keys(req.cookies).forEach(cookie => {
            res.clearCookie(cookie, { httpOnly: true, secure: true, sameSite: 'Strict' });
        });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        console.log("JWT Token Generated!! Successfully", token);
        

        return res.status(201).json({ message: 'User created successfully', user: newUser, token: token });
        
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ Sign Up Failed!! Server Error");
    }
});

router.post('/login', async (req, res) => {
    try {
        // Check if JWT token exists in cookies, if yes then return 200 status
        // -----------------------------------------------------------------------
        const pretoken = req.cookies.token;
        console.log("Pre-existing token found!!\n", pretoken);
        
        if (pretoken) {
            try {
                // Verify the token
                const decoded = jwt.verify(pretoken, JWT_SECRET);
                console.log("Valid session found!!", decoded);
                
                // Fetch user details from the database and check if there is a user with the same id
                // If yes, then return 200 status and user details
                const sessionUser = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
                if (sessionUser.rows.length > 0) {
                    console.log("Session user found!!", sessionUser.rows[0]);
                    console.log("Session restored!! Redirecting to dashboard...");
                    return res.status(200).json({ message: 'Session restored. Redirecting to dashboard...', user: sessionUser.rows[0], token: pretoken });
                }
            } catch (err) {
                console.error("Invalid or expired token!!", err);
                // Proceed to normal login flow
            }
        }
        // -----------------------------------------------------------------------
        
        
        // If no valid token, proceed with login
        // -----------------------------------------------------------------------
        
        const { email, password } = req.body;

        if (email === "" || password=== "") {
            console.error("Email not found")
            return res.status(401).json({ error: 'Request body is empty' });
        }

        console.log("Login Data Received!!", req.body);
        // Check if the user exists
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            console.log("User not found!!");
            return res.status(404).json({ error: 'User not found. Please sign up.' });
        }
        const user = userResult.rows[0];
        console.log("User found!!", user);

        const isPasswordMatch = await comparePassword(password, user.password);
        if (!isPasswordMatch) {
            console.log("Password mismatch!!");
            return res.status(401).json({ error: 'Invalid credentials. Please try again.' });
        }
        console.log("Password matched!!");
        console.log("User logged in successfully!!", user);
        
        if (await isSameDay(user.last_login)) {

            console.log("Already logged in today. Not incrementing count.");
        } else if (await isOneDayPriorToToday(user.last_login)) {
            // Continue the streak
            const today = new Date();
            const newLoginCount = user.login_count + 1;
            console.log(user.login_count);
            
            console.log(newLoginCount);
            
            const query = `
                UPDATE users
                SET login_count = $1,
                last_login = $2,
                max_streak = CASE
                                WHEN max_streak is null OR $1 > max_streak THEN $1
                                ELSE max_streak
                            END
                WHERE id = $3
            `
            await pool.query(query, [newLoginCount, today, user.id]);
            console.log("Streak continued!");
        }

        else {
            const today = new Date();
            // Reset streak
            await pool.query('UPDATE users SET login_count = 1, last_login = $1 WHERE id = $2', [today, user.id]);
            console.log("Streak reset!");
    
        }


        // Generate JWT token
        const tokenPayload = { id: user.id, email: user.email };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        console.log("JWT Token Generated!! Successfully", token);

        return res.status(200).json({ message: 'Login successful. Redirecting to dashboard...', user: user, token: token });

        // -----------------------------------------------------------------------


    } catch (err) {
        console.error(err);
        res.status(500).send("❌ Login Failed!! Server Error");
    }
});


router.get('/userdetails', async (req, res) => {
    try {
        // Check if JWT token exists in cookies
        const token = req.cookies.token;
        console.log("Token found!!\n", token);
        
        // If no token, return 401 status
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify the token and fetch user details
        // If valid token is found, move ahead
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        
        if (user.rows.length === 0) {
            // User not found in the database
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user details and dashboard data
        return res.status(200).json({ message: 'Dashboard data', user: user.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("❌ Dashboard Fetch Failed!! Server Error");
    }
});

router.post('/logout', async (req, res) => {

    try {
        // Clear the JWT token from cookies
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'Strict' });
        console.log("JWT Token cleared!! Successfully");

        return res.status(200).json({ message: 'Logout successful. Redirecting to login page...' });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("❌ Logout Failed!! Server Error");
    }
}
);


// games store the game id and questions
const games = {}

async function _readGoogleSheet(googleSheetClient, sheetId) {
    const res = await googleSheetClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet3'
    });
  
    return res.data.values;
  }

  async function _getGoogleSheetClient(serviceAccountKeyFile) {
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountKeyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    return google.sheets({
      version: 'v4',
      auth: authClient,
    });
  }
  
router.post('/start-game', async (req, res) => {
    try {
        const gameId = uuidv4();
        const { userId } = req.body;
        const questions = [];
        // const fPath = path.join(__dirname, "../data/questions.csv");
        const serviceAccountKeyFile = path.join(__dirname, "./mathlete-444209-eab9d80e1a33.json")
        const sheetId = "1IhQrmIssU_p03ZB8IRJm0odYCKBUPxliY6KV4QckfVI"

        try {
            const googleSheetClient = await _getGoogleSheetClient(serviceAccountKeyFile);
            const data = await _readGoogleSheet(googleSheetClient, sheetId)
            console.log(data);
    
            data.slice(1).forEach(row => { // Skip the first row
                if (row.length >= 2) {
                questions.push({ Questions: row[0], Answers: row[1], Time: row[2] });
                }
            });
            console.log(questions);
            const shuffledQuestions = _.shuffle(questions);
            games[gameId] = shuffledQuestions;
            res.status(200).json({
                    redirectUrl: `/ib/${gameId}`,
                    gameId
                });
            } catch(e) {
                    console.error('Failed to read:', e);
                    res.status(500).json({ error: 'Failed to read questions' })
                }
                
                
                
            //     fs.createReadStream(fPath)
            //     .pipe(csv())
            //     .on('data', (data) => {
            //         questions.push(data);
            //         console.log(questions);
                    
            //     })
            //     .on('end', () => {
                    
            //         // TODO: Store these shuffled questions based in games
            //         const shuffledQuestions = _.shuffle(questions);
            //         games[gameId] = shuffledQuestions;
            //     // console.log(gameId);
            //     // console.log(shuffledQuestions);
                
            //     res.status(200).json({
            //         redirectUrl: `/ib/${gameId}`,
            //         gameId
            //     });
            // })
            // .on('error', (error) => {
            //     console.error('Failed to read questions.csv:', error);
            //     res.status(500).json({ error: 'Failed to read questions' });
            // });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start the game' });
    }
});

router.post('/start-game-1', async (req, res) => {
    try {
        const gameId = uuidv4();
        const { userId } = req.body;
        const questions = [];
        // const fPath = path.join(__dirname, "../data/questions.csv");
        const serviceAccountKeyFile = path.join(__dirname, "./mathlete-444209-eab9d80e1a33.json")
        const sheetId = "1IhQrmIssU_p03ZB8IRJm0odYCKBUPxliY6KV4QckfVI"

        try {
            const googleSheetClient = await _getGoogleSheetClient(serviceAccountKeyFile);
            const data = await _readGoogleSheet(googleSheetClient, sheetId)
            console.log(data);
    
            data.slice(1).forEach(row => { // Skip the first row
                if (row.length >= 2) {
                questions.push({ Type: row[0], Question: row[1], Answer: row[2], OptionA: row[3], OptionB: row[4], OptionC: row[5], Time: row[6]});
                }
            });
            console.log(questions);
            const shuffledQuestions = _.shuffle(questions);
            games[gameId] = shuffledQuestions;
            res.status(200).json({
                    redirectUrl: `/ib/${gameId}`,
                    gameId
                });
            } catch(e) {
                    console.error('Failed to read:', e);
                    res.status(500).json({ error: 'Failed to read questions' })
                }
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({ error: 'Failed to start the game' });
    }
});

router.get('/ib/:gameId', async (req, res) => {
    const {gameId} = req.params;
    console.log("Game ID received!!", gameId);

    return res.status(200).json({ message: 'Game ID received successfully', gameId });
});

// router.get('/questions', (req, res) => {
//     const questions = []
//     const fPath = path.join(__dirname, "../data/questions.csv")

//     fs.createReadStream(fPath)
//         .pipe(csv())
//         .on('data', (data)=>{
//             console.log(data);
//             questions.push(data)
//         })
//         .on('end', ()=> {
//             res.status(200).json({questions: questions});
//         })
//         .on('error', ()=> {
//             res.status(500).json({error: "Failed to read questions.csv"})
//         });
// });

router.get('/questions/:gameId/:questionNumber', async (req, res) => {
    const {gameId, questionNumber} = req.params;
    console.log(gameId, questionNumber);
    
    const qNum = parseInt(questionNumber)
    const shuffledQuestions = games[gameId];
    // console.log(shuffledQuestions);
    
    
    if (!shuffledQuestions) {
        return res.status(404).json({ error: "Game not found or questions not loaded" });
    }

    if (qNum >= 0 && qNum < shuffledQuestions.length) {
        console.log(shuffledQuestions[qNum]["Question"]);
        console.log("Question Sent!!", shuffledQuestions[qNum]["Answer"]);
        
        res.status(200).json({
            question: shuffledQuestions[qNum]["Question"],
            totalQuestions: shuffledQuestions.length,
            currentQuestion: qNum,
            Time: shuffledQuestions[qNum]["Time"],
            qType: shuffledQuestions[qNum]["Type"],
            OptionA: shuffledQuestions[qNum]["OptionA"],
            OptionB: shuffledQuestions[qNum]["OptionB"],
            OptionC: shuffledQuestions[qNum]["OptionC"],
        });
    } else {
        res.status(404).json({ error: "Question not found" });
    }

})

router.post('/validate-answer/:gameId/:questionNumber', (req, res) => {
    const { gameId, questionNumber } = req.params;
    const userAnswer = req.body;
    console.log(typeof(questionNumber));
    console.log(questionNumber);
    
    const qNum = parseInt(questionNumber);
    console.log(typeof(qNum));
    console.log(qNum);
    

    // access questions using the gameId from the games objects
    const shuffledQuestions = games[gameId];

    if (!shuffledQuestions) {
        return res.status(404).json({ error: "Game not found or questions not loaded" });
    }

    if (qNum >= 0 && qNum < shuffledQuestions.length) {
        const correctAnswer = shuffledQuestions[qNum]["Answer"];
        console.log(correctAnswer);
        console.log(typeof(correctAnswer))

        console.log(userAnswer, typeof(userAnswer));
        
        
        const isCorrect = userAnswer["ua"].trim() === correctAnswer;
        res.status(200).json({
            isCorrect: isCorrect,
            correctAnswer: isCorrect ? null : correctAnswer
        });
    } else {
        res.status(404).json({ error: "Question not found" });
    }
});

router.get('/get-score/:userId', async (req, res) => {
    console.log(req);
    
    const { userId } = req.params;
    console.log(userId);
    console.log(typeof(userId));
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const result = await pool.query('SELECT ib_points FROM users WHERE id = $1', [parsedUserId]);
        console.log(result);
        
        res.status(200).json({ score: result.rows[0].ib_points });
    } catch (error) {
        console.error('Error fetching score:', error);
        res.status(500).json({ error: 'Failed to fetch score' });
    }
});

router.post('/update-score', async (req, res) => {
    const { userId, newScore } = req.body;
    console.log(userId, typeof(userId));
    console.log(newScore, typeof(newScore));
    const roundedScore = Math.round(newScore);
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction
        const result = await client.query('UPDATE users SET ib_points = $1 WHERE id = $2', [roundedScore, userId]);
        await client.query('COMMIT'); 
        console.log("Updated Successfully");
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Score updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating score:', error);
        res.status(500).json({ error: 'Failed to update score' });
    }
    finally {
        client.release()
    }
      
});

router.get('/top-users', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT id, name, email, ib_points AS points
        FROM users
        ORDER BY ib_points DESC
        LIMIT 9
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
});  


router.get('/leaderboard', async (req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT id, name, ib_points AS points, email
        FROM users
        ORDER BY ib_points DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

router.post('/update-username', async(req, res) => {
    const {userId, username} = req.body

    if (!username || username.trim().length === 0) {
        return res.status(400).json({error: "Username is required"})
    }

    try {
        const result = await pool.query(
            'UPDATE users SET name = $1 WHERE id=$2 RETURNING id, name', [username.trim(), userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({error: 'User not found'});
        }
        res.status(200).json({ message: 'Username updated successfully', user: result.rows[0] });
    }
    catch (err) {
        console.error('Error updating username:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}) 

router.get('/top-range/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
        const result = await getUserTopRange(userId);
        if (result.error) {
            return res.status(404).json({ error: result.error });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching top range:', error);
        res.status(500).json({ error: 'Failed to fetch top range' });
    }
});


module.exports = router;
