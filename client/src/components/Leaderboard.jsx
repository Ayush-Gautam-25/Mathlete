// import React from 'react';
import NavbarAfterLogin from './NavbarAfterLogin';
import "../style/leaderboard.css"
import { useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LeaderboardImg from "../imgs/leaderboard-img.png"
import UserLogo from '../imgs/userlogo.png'; // Adjust the path as necessary

import { red, pink, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange, deepOrange, brown, blueGrey } from '@mui/material/colors';

const colorArray = [
    red,
    pink,
    purple,
    deepPurple,
    indigo,
    blue,
    lightBlue,
    cyan,
    teal,
    green,
    lightGreen,
    lime,
    yellow,
    amber,
    orange,
    deepOrange,
    brown,
    blueGrey
  ];
  
const shades = [500, 600, 700, 800, 900, "A200", "A400", "A700"]

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = React.useState({
        name: '',
        university: '',
        streak: 0,
        points: 0,
        email: '',
    });

    const storedColor = localStorage.getItem(`userColor_${user.email}`);
    const navigate = useNavigate();

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
                        name: data.user.name,
                        university: data.user.university,
                        streak: data.user.login_count,
                        points: data.user.ib_points,
                        email: data.user.email
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


    const profileData = {
        name: "You",
        university: user.university,
        points: `${user.points} pts`,
    }

    const assignColors = (data) => {
        const coloredData = data.map(user => {
            const storedColor = localStorage.getItem(`userColor_${user.email}`);
            if (storedColor) {
                return { ...user, color: storedColor };
            } else {
                const randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
                const randomShade = shades[Math.floor(Math.random() * shades.length)];
                const newColor = randomColor[randomShade];
                localStorage.setItem(`userColor_${user.email}`, newColor);
                return { ...user, color: newColor };
            }
        });
        return coloredData;
    };



    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const response = await fetch('/api/leaderboard');
                const data = await response.json();
                const dataWithColors = assignColors(data); // Assign colors
                setLeaderboardData(dataWithColors);
                console.log(data);

            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    if (loading) {
        return <>
            <NavbarAfterLogin />
            <LoadingMessage>Loading Leaderboard...</LoadingMessage>;
        </>
    }

    let userRank = 0;

    return (
        <>

            <NavbarAfterLogin />
            <div className="leaderboard-main">
                <div className="leaderboard__heading">
                    <div className="leaderboard__heading__title">
                        <div id='heading__title-title'>Winning is a habit.</div>
                        <div id='heading__title-subtitle'>View the full leaderboard below</div>
                    </div>
                    <div id="leaderboard-img">
                        <img src={LeaderboardImg} width={130} alt="" style={{ transform: 'translateY(10px)' }} />
                    </div>
                </div>
                <div className="leaderboard__content">
                    <div className="content__main">
                        <table className='leaderboard__table' style={{ borderRadius: '5px' }}>
                            <thead style={{}}>
                                <tr >
                                    <th style={{ width: "7%", padding: '10px', borderRadius: '5px 0 0 5px' }}>ID</th>
                                    <th style={{ width: "63%" }}>Player</th>
                                    <th style={{ width: "30%", borderRadius: '0 5px 5px 0' }}>Points</th>

                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((tempuser, index) => {
                                    console.log(leaderboardData);
                                    console.log(user.email);

                                    console.log(leaderboardData[index].email === user.email);
                                    if (leaderboardData[index].email === user.email) {
                                        userRank = index + 1
                                    }
                                    const randomColor = colorArray[Math.floor(Math.random() * colorArray.length)];
                                    const randomShade = shades[Math.floor(Math.random() * shades.length)];

                                    return (
                                        <tr>
                                            <td><div className='table__index'
                                                key={tempuser.id}
                                                style={{
                                                    backgroundColor:
                                                        index + 1 === 1 ? '#F7C631' :
                                                            index + 1 === 2 ? '#BEBDB9' :
                                                                index + 1 === 3 ? '#D5A47C' : 'black',
                                                    color: index + 1 <= 3 ? 'black' : 'white'
                                                }}
                                            >{`#${index + 1}`}</div></td>
                                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div 
                                                style={{backgroundColor: tempuser.color, width: 'fit-content', padding: '10px', borderRadius: '50%', color: 'white' }}
                                                >{leaderboardData[index].name === "" ? "UN" : `${leaderboardData[index].name[0]}${leaderboardData[index].name[1]}`.toUpperCase()}</div>
                                                <div>
                                                    {leaderboardData[index].email === user.email ? "You" : tempuser.name}
                                                </div>
                                            </td>
                                            <td>{tempuser.points}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="content__profile">
                        <div className="div1">
                            <div style={{backgroundColor: storedColor, fontSize: '25px', padding: '20px', borderRadius: '50%', color: 'white'}}>
                            {user.name === "" ? "UN" : `${user.name[0]}${user.name[1]}`.toUpperCase()}
                            </div>
                                                
                            {/* <img src={UserLogo} alt="User Logo" width={80} height={80} /> */}
                            <div className="profile__text" style={{textAlign: 'center'}}>
                                <span style={{ fontWeight: "700", fontSize: '18px', textAlign: 'center' }}>{profileData.name}</span><br />
                                <span style={{ fontSize: '14px', textAlign: 'center' }}>UCL</span> <br />
                                <span style={{ fontSize: '14px' }}>{profileData.points}</span> <br />
                            </div>
                        </div>
                        <div className="div2">
                            <span style={{ fontSize: '14px' }}>Rank #{userRank}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const LoadingMessage = styled.div`
                text-align: center;
                padding: 0;
                font-size: 1.2em;
                `;

export default Leaderboard;
