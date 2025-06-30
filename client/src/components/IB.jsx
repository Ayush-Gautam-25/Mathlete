// import {React, useState, useEffect} from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// const IB = () => {

//     const {gameId} = useParams();


//     useEffect(() => {
//         const fetchUserDetails = async() => {
//             const res = await fetch(`/api/ib/${gameId}/`, { credentials: 'include' });
//             const data = await res.json();

//             console.log("Game ID: ", data.message);
//         }

//         fetchUserDetails()
//             .then(() => {
//                 console.log("Game ID: ", gameId);
//             })
//             .catch((err) => {
//                 console.error(err);
//             });
  
//     }, [gameId]);


//     return (
//         <div className='ib'>
//             <h1>IB</h1>
//             <h2>Game ID: {gameId}</h2>
//         </div>
//     );
// }

// export default IB;



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Instructions from './Instructions';
import IBGame from './IBGame';
import jwtDecode from "jwt-decode"
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';


const IB = () => {
  const { gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [started, setStarted] = useState(false);

  const [score, setScore] = useState(null); // Initialize with null
  const [fs_exit, setFsExit] = useState(false);

    const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    
  })

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const res = await fetch(`/api/ib/${gameId}/`, { credentials: 'include' });
        const data = await res.json();
        console.log("Game Data:", data);
        setGameData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGameData()
      .then(() => {
        console.log("Game ID: ", gameId);
      })
      .catch((err) => {
        console.error(err);
      });

  }, [gameId]);

  useEffect(() => {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());
    document.addEventListener('selectstart', (e) => e.preventDefault());
  
    return () => {
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
      document.removeEventListener('copy', (e) => e.preventDefault());
      document.removeEventListener('cut', (e) => e.preventDefault());
      document.removeEventListener('paste', (e) => e.preventDefault());
      document.removeEventListener('selectstart', (e) => e.preventDefault());
    };
  }, []);

  useEffect(() => {
    const checkFullScreen = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        console.log("Exited Fullscreen");
        // setFsExit(true); // Set fsExit to true when exiting fullscreen
      }
    };
  
    document.addEventListener('fullscreenchange', checkFullScreen);
    return () => document.removeEventListener('fullscreenchange', checkFullScreen);
  }, []);
  
  const handleStart = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
        .then(() => {
          console.log("Fullscreen started");
          setStarted(true);
        })
        .catch((err) => {
          console.error("Fullscreen failed:", err);
        });
    }
  };

  useEffect(() => {
    if (!started) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
          .then(() => {
            console.log("Fullscreen started for instructions");
          })
          .catch((err) => {
            console.error("Fullscreen failed:", err);
          });
      }
    }
  }, [started]);

  useEffect(() => {
    if (fs_exit) {
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 500); // Redirect after 3 seconds

        return () => clearTimeout(timer); // Clear timeout if component unmounts
    }
}, [fs_exit, navigate]);

  return (
    // <div className='ib' onClick={!started ? handleStart : undefined} style={{ cursor: !started ? 'pointer' : 'default' }}>
    <div className='ib' onClick={!started ? handleStart : undefined} style={{ cursor: !started ? 'pointer' : 'default' }}>
      {/* {
        fs_exit ? (
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%)',
            height: '20vh',
            width: '35vw',
            backgroundColor: '#000000dd',
            margin: 'auto',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'sans-serif',
            fontSize: '20px',
            zIndex: 10000,
            borderRadius: '10px',
            padding: '20px',
          }}>
            <p>Fullscreen mode exited. Click below to go on Dashboard!!</p>
            <button onClick={
              fs_exit ? () => {
                navigate('/dashboard')
              } : undefined
            }
              style={{
                padding: '10px 20px',
                backgroundColor: '#007BFF',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >Dashboard</button>
          </div>
        ) : null
      } */}
      <Popup
        open={fs_exit}
                modal
                closeOnDocumentClick={false}
                onClose={() => {}}
                contentStyle={{
                    width: 'auto',
                    height: 'auto',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                }}
            >
                <div>
                    Navigating to dashboard...
                </div>
        </Popup>
      {(!started) ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: "translate(-50%, -50%)"
        }}>
          <Instructions />
        </div>
      ) : (
        <div>
          <IBGame />
        </div>
      )}
    </div>
  );
};

export default IB;
