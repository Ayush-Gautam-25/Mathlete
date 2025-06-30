import {React, useEffect, useState, useRef} from 'react';
import LatexRenderer from './LatexRenderer';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import NavbarAfterLogin from './NavbarAfterLogin';
import EastIcon from '@mui/icons-material/East';
import ProgressBar from './ProgressBar';
import StraightIcon from '@mui/icons-material/Straight';


const IBGame = () => {

    const { gameId } = useParams();
    const [gameData, setGameData] = useState({
        qType: '',
        userName: '',
        totalCorrect: 0,
        totalTillNow: 0,
        userAnswer: '',
        streak: 0,
        accuracy: 0,
        score: null,
        question: '',
        totalQuestions: 0,
        currentQuestionNo: 0,
        prevQuestionStatus: false,
        submitting: false,
        gameOver: false,
        timeLimit: 0,
        OptionA: '',
        OptionB: '',
        OptionC: '',
    })

    const navigate = useNavigate()

    const token = localStorage.getItem("token")
    const decodedToken = jwtDecode(token);
    const id = decodedToken.id
    const email = decodedToken.email
    const storedColor = localStorage.getItem(`userColor_${email}`);

    useEffect(() => {
        // Disable back button
        const disableBackButton = () => {
          window.history.pushState(null, null, window.location.href);
        };
    
        // Add event listener for popstate
        const handlePopState = (event) => {
          window.history.pushState(null, null, window.location.href); // Prevent navigating back
          alert("You cannot go back during the game!");
        };
    
        window.addEventListener('popstate', handlePopState);
        disableBackButton(); // Push initial state
    
        return () => {
          window.removeEventListener('popstate', handlePopState); // Cleanup on unmount
        };
      }, []);

    

    useEffect(()=> {
        const fetchQuestion = async() => {
            try {
                const qno = gameData.currentQuestionNo
                const response = await fetch(`http://localhost:5000/api/questions/${gameId}/${qno}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                console.log(response);
                
                if (response.status !== 200) {
                    throw new Error(`Failed to fetch question (Status: ${response.status})`);
                }

                const data = await response.json();
                console.log(data);
                
                setGameData(prev => ({ 
                    ...prev, 
                    question: data.question, 
                    totalQuestions: data.totalQuestions ,
                    timeLimit: data.Time,
                    qType: data.qType,
                    OptionA: data.OptionA,
                    OptionB: data.OptionB,
                    OptionC: data.OptionC,
                }));
                localStorage.setItem("totalQuestions", data.totalQuestions);
                localStorage.setItem("timeLimit", data.Time)

                setGameData(prev => ({ ...prev, userAnswer: '' }));
        

            } catch (error) {
                console.error('Error fetching question:', error);
            }
        }

        if (!gameData.gameOver) {
            fetchQuestion();
        }
    }, [gameId, gameData.currentQuestionNo, gameData.gameOver])

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/userdetails`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.status === 401) {
                    // Optionally clear any auth state or tokens
                    navigate('/login'); // redirect to login page
                    return;
                  }              

                if (response.status === 200) {
                    const data = await response.json();
                    console.log(data.user.name);
                    
                    localStorage.setItem("userName", data.user.name); // Store the user name in localStorage
                    return
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [id]);

    useEffect(() => {
        const fetchScore = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/get-score/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    const data = await response.json();
                    setGameData(prev => ({ ...prev, score: data['score'] })); // Set the fetched score in gameData
                } else if (response.status === 404) {
                    console.error('User not found');
                } else {
                    console.error('Failed to fetch score');
                }
            } catch (error) {
                console.error('Error fetching score:', error);
                
            }
        };

        fetchScore();
    }, [id]);

    const [timer, setTimer] = useState();
    const timerRef = useRef(timer);



    useEffect(() => {
        // Reset timer every time question changes
        const storedTimeLimit = parseInt(localStorage.getItem("timeLimit"), 10);
        const initialTime = isNaN(storedTimeLimit) ? gameData.timeLimit : storedTimeLimit;
        setTimer(initialTime);
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 0) {
                    clearInterval(timerRef.current);
                    handleTimeout(); // Move to next question
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [gameData.currentQuestionNo]);


    const handleTimeout = async () => {
        // Optionally, you can treat timeout as an incorrect answer or skip
        console.log(gameData.currentQuestionNo);
        const totalQuestions = parseInt(localStorage.getItem("totalQuestions"), 10);
        console.log(gameData.totalTillNow);
        
        if (gameData.currentQuestionNo < totalQuestions - 1) {
            
            console.log(gameData.currentQuestionNo);
            const qno = gameData.currentQuestionNo + 1;
            setGameData(prev => {
                const newTotalTillNow = prev.totalTillNow + 0.5;
                
                const newAccuracy = prev.totalCorrect / (newTotalTillNow);
                return {
                    ...prev,
                    totalTillNow: newTotalTillNow,
                    currentQuestionNo: qno,
                    streak: 0,
                    accuracy: newAccuracy,
                };
            });
            
            // await endGame();
        } else {
            // End of quiz/game
            // await endGame();
             const sc = gameData.score
             // Navigate to dashboard after 1 second
            setTimeout(() => {
               navigate('/dashboard', { state: { sc } });
            }, 1000);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        setGameData(prev => ({ ...prev, submitting: true }));
        const ua = gameData.userAnswer
        const qno = gameData.currentQuestionNo                
        try {
            const response = await fetch(`http://localhost:5000/api/validate-answer/${gameId}/${qno}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ua })
            });

            if (response.status !== 200) {
                throw new Error('Failed to validate answer');
            }

            const data = await response.json();
            console.log(data);            

            setGameData(prev => ({ ...prev, submitting: false }));  // Enable the button on return
            setGameData(prev => ({ ...prev, totalTillNow: prev.totalTillNow + 1 }));
            if (gameData.prevQuestionStatus && data.isCorrect) {
                setGameData(prev => ({ ...prev, streak: prev.streak + 1 }));
            }
            else if (!data.isCorrect) {
                setGameData(prev => ({ ...prev, streak: 0 }));
            }
            else {
                 setGameData(prev => ({ ...prev, streak: 1 }));
            }
            setGameData(prev => ({ ...prev, prevQuestionStatus: data.isCorrect }));
            if (data.isCorrect) {
                setGameData(prev => ({ ...prev, totalCorrect: prev.totalCorrect + 1 }));
                setGameData(prev => ({ 
                    ...prev, 

                    accuracy: ((prev.totalCorrect) / (prev.totalTillNow))
                }));
                const sc = Math.round(gameData.score + 0.5*gameData.streak + 0.1*gameData.accuracy + 10.5);
                setGameData(prev => ({ ...prev, score: sc }));
                localStorage.setItem("score", sc)
            } else {
                setGameData(prev => ({ 
                    ...prev, 
                    accuracy: ((prev.totalCorrect) / (prev.totalTillNow))
                }));
                const sc = gameData.score - 5;
                setGameData(prev => ({ ...prev, score: sc}));
                localStorage.setItem("score", sc)

            }
            if (gameData.currentQuestionNo < gameData.totalQuestions-1) {
                setGameData(prev => ({ ...prev, currentQuestionNo: prev.currentQuestionNo + 1 })); // move to next question
                await endGame();
            } 
            else {
                await endGame();
                const sc = gameData.score;
                navigate('/dashboard', { state: { sc } });
            }
        } catch (e) {
            console.error("error:", e);
            
        }
    }

    const endGame = async () => {

        try {
            console.log("Score just before ending the question:", gameData.score);
            
            const response = await fetch('http://localhost:5000/api/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                
                body: JSON.stringify({
                    userId: id, // Assuming userId is available
                    newScore: localStorage.getItem('score'), // Send the final score
                }),
            });

            if (response.status === 200) {
                console.log('Score updated successfully');
                return
            } else {
                console.error('Failed to update score');
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    };

    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
        gameData.userName = storedUserName;
    }

    // console.log(storedUserName);
    


    return (
        <div className='ibgame-container'>
            <NavbarAfterLogin />
            <div className="ibgame__main">
                <div className="main__heading">Ready, set ... integrate!</div>
                <div className="main__body">
                    <div className="body__quest">
                        <div className="quest__quest-timer">
                            <div className="quest__quest-timer-quest">
                                {/* Render the current question */}
                                <LatexRenderer latex={gameData.question} />
                            </div>
                            <div className="quest__quest-timer-timer">
                            ⏰ Time: {formatTime(timer)}
                            </div>
                        </div>
                        <div className="quest__answer">
                            <input 
                                type="text" 
                                value={gameData.userAnswer}
                                placeholder="Enter your answer here ..."
                                onChange={(e) => setGameData(prev => ({ ...prev, userAnswer: e.target.value }))}
                                disabled={gameData.submitting || gameData.gameOver} 
                            />
                        </div>
                        <div className="quest__submit"  >
                            <button
                                onClick={handleSubmit}
                                disabled={gameData.submitting || gameData.userAnswer.trim() === '' || gameData.gameOver}
                            >
                                {gameData.submitting ? "Submitting..." :(
                                    <div style={{display: 'flex', alignItems: 'center', fontSize: "12px", gap:'5px'}}>
                                        <div>Submit</div>
                                        <EastIcon style={{fontSize: '13px'}} />
                                    </div>

                                )}
                            </button>
                        </div>
                    </div>
                    <div className="body__profile">
                        <div style={{backgroundColor: storedColor, 
                            textAlign: 'center', 
                            aspectRatio: '1/1', 
                            width: '30px' , 
                            fontSize: '25px', 
                            padding: '20px', 
                            borderRadius: '50%', 
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {gameData.userName === "" ? "UN" : `${gameData.userName[0]}${gameData.userName[1]}`.toUpperCase()}
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontSize: '18px', fontWeight: 'bold'}}>You</div>
                            <div className="profile__pts">
                                {gameData.score} pts 
                                {gameData.prevQuestionStatus ? (
                                    <StraightIcon style={{ transform: 'rotate(0deg)', color: 'green' }} />
                                ) : (
                                    <StraightIcon style={{ transform: 'rotate(180deg)', color: 'red' }} />
                                )}
                            </div>
                            <div></div>
                        </div>
                        </div>
                        </div>
                        <div className="main__progress">
                            <ProgressBar value={gameData.currentQuestionNo} max={gameData.totalQuestions-1} />
                            {/* {gameData.totalTillNow} <br />
                            {gameData.totalCorrect} */}
                </div>
                <div className="main__footer">
                    🚀 Streak: {gameData.streak} | 🎯 Accuracy: {Math.round(gameData.accuracy * 100)}%
                </div>
            </div>
        </div>
    );
}

export default IBGame;
