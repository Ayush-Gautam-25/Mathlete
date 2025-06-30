import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import NavbarAfterLogin from './NavbarAfterLogin';
import '../style/dashboard.css'; // Adjust the path as necessary
import ManSitting from '../imgs/mansittingdashboard.png'; // Adjust the path as necessary
import EastIcon from '@mui/icons-material/East';
import UserLogo from '../imgs/userlogo.png'; // Adjust the path as necessary
import LeadershipSmall from './LeadershipSmall';
import "../style/leadershipsmall.css"

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Settings from './Settings';
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
    const [user, setUser] = React.useState({
        id: 0,
        name: '',
        university: '',
        streak: 0,
        points: 0,
        topRange: ''
    });
    const [loader, showLoader] = useState(false)
    const navigate = useNavigate();
    const token = localStorage.getItem("token")
    const decodedToken = jwtDecode(token);
    const id = decodedToken.id

    useEffect(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
                console.error('Error exiting full screen:', err);
            });
        }
    }, []);

    const fetchTopRange = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/top-range/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status === 200) {
                const data = await response.json();
                setUser(prev => ({ ...prev, topRange: data.topRange }));
            } else {
                console.error('Failed to fetch top range:', response.status);
            }
        } catch (error) {
            console.error('Error fetching top range:', error);
        }
    };

    useEffect(() => {
        fetchTopRange();
    }, [user.points]);


    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 3600000); // 1 hour in milliseconds

        return () => clearInterval(interval); // Cleanup on component unmount

    }, []);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/userdetails', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                console.log("Response from server:", res);

                if (res.status === 500 || res.status == 401) {
                    navigate('/login');
                } else if (res.status === 404) {
                    navigate('/signup');
                }
                else if (res.status === 200) {
                    const data = await res.json();

                    setUser({
                        id: data.user.id,
                        name: data.user.name,
                        university: data.user.university,
                        streak: data.user.login_count,
                        points: data.user.ib_points
                    });
                    console.log('User data:', data.user);
                    console.log('Session is valid. User is logged in.');

                } else {
                    console.log('Unexpected response:', res.status);
                }
            } catch (err) {
                console.error('Error checking session:', err);
            }
        };

        checkSession();
    }, [navigate]);
    const today = new Date();
    const targetDate = new Date('2025-04-26');
    const timeDiff = targetDate - today;

    const profileData = {
        name: "You",
        university: user.university,
        points: `${user.points} pts`,
    }


    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const percentage = 75;
    const data = [
        {
            icon: "🔥",
            name: "Streak",
            value: `${user.streak} days`,
            extra: "",
        },
        {
            icon: "📈",
            name: "Rank",
            value: user.topRange,
            extra: "of cohort"
        },
        // {
        //     icon: "⏳",
        //     name: "Time",
        //     value: `${daysLeft} days`,
        //     extra: "until winner revealed",
        // },

    ]
    const [open, setOpen] = useState(false);
    const handleTriggerClick = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/start-game-1', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ userId: user.id })
            });


            if (res.status === 200) {
                const data = await res.json();
                // showLoader(true);
                setTimeout(() => {
                    console.log('Game starting...');
                    navigate(data.redirectUrl);
                }, 500);

            } else {
                console.log('Failed to start game:', res.status);
            }
            setOpen(true);
        } catch (err) {
            console.error('Error starting game:', err);
        }
    }

    useEffect(() => {
        if (open) {
            handleTriggerClick();
        }
    }, [open])

    return (
        <div
            className='dashboard-container'
            style={{
                // padding: '20px', 
                fontFamily: 'Arial, sans-serif',
                opacity: loader ? 0.5 : 1,
                backgroundColor: loader ? 'darkgrey' : 'white',
                pointerEvents: loader ? 'none' : 'auto'
            }}
        >
            <NavbarAfterLogin />
            <div style={{ textAlign: 'right', margin: '10px' }}>
                {/* <button 
                    className="logout-button" 
                    onClick={async () => {
                        try {
                            const res = await fetch('http://localhost:5000/api/logout', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                            });

                            if (res.status === 200) {
                                console.log('Logout successful');
                                navigate('/login');
                            } else {
                                console.log('Failed to logout:', res.status);
                            }
                        } catch (err) {
                            console.error('Error during logout:', err);
                        }
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Logout
                </button> */}
            </div>
            <div className='dashboard-flexbox-parent'>
                <span id="dashboard-quote">“Success is the sum of small efforts, repeated day in and day out. ” -Robert Collier</span>
                <img id="man-sitting" src={ManSitting} alt='Man Sitting' width={90} style={{ position: 'absolute', left: '60%', top: '8%' }} />
                <div className='dashboard-flexbox' id="msgbox">
                    <div className="msgbox-main">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', width: '100%' }}>
                            <span id="welcome-text">Welcome Back {user.name} 👋</span>
                            <span id="ready-text">Ready for some integration challenge?</span>
                        </div>

                        <div>
                            <Popup
                                open={open}
                                onOpen={() => setOpen(true)}
                                onClose={() => setOpen(false)}

                                modal
                                overlayStyle={{ background: 'rgba(0, 0, 0, 0.5)' }}
                                contentStyle={{
                                    width: "80px",
                                    height: "30px",
                                    borderRadius: "5px",
                                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
                                }}
                                trigger={
                                    <button className="ib-playbutton">
                                        <span>Let's Calculate</span>
                                        <EastIcon style={{ fontSize: '20px', marginLeft: '5px' }} />
                                    </button>
                                }

                            >
                                <div
                                    style={{
                                        position: 'fixed',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 1000,
                                        padding: '20px',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <span

                                    >Loading...</span>
                                </div>
                            </Popup>
                            <div className='extra__info' style={{ marginTop: '10px', fontSize: '14px', color: '#4C5664' }}>
                                {data.map((item, index) => (
                                    <span key={index} style={{ display: 'inline-block', marginRight: '5px' }}>
                                        {item.icon} {item.name}: <strong>{item.value}</strong> {item.extra} <strong>{index < data.length - 1 && '|'}</strong>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-profile" >
                        <Settings id={user.id} />
                        <div>
                            <img src={UserLogo} alt="User Logo" width={100} height={100} />
                            <div className="dashboard-profile-text">
                                <br />
                                <span style={{ fontWeight: "700", fontSize: '18px' }}>{profileData.name}</span><br />
                                <span style={{ fontSize: '14px' }}>UCL</span> <br />
                                <span style={{ fontSize: '14px' }}>{profileData.points}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='dashboard-flexbox' id="leaderboardbox">
                    <LeadershipSmall loader={loader} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;