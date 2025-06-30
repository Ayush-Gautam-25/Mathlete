import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EastIcon from '@mui/icons-material/East';
import SettingsImg from "../imgs/settings-img.png"
import LogoutIcon from '@mui/icons-material/Logout';
import '../style/dashboard.css'; // Adjust the path as necessary
import WestIcon from '@mui/icons-material/West';

const Settings = (id) => {
    const navigate = useNavigate()
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);


    const handleProfileSubmit = async() => {
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }

        // setLoading(true);
        try {
            console.log(id, username);
            const userId = id["id"];
            
            const res = await fetch("http://localhost:5000/api/update-username", {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({userId, username})
            });
            const data = await res.json();

            switch(res.status) {
                case 200:
                    alert("Username Updated successfully");
                    setIsEditingProfile(false);
                    break;
                case 400:
                    alert(data.error || "Invalid request format");
                    break
                case 404:
                    alert(data.error || "User not found. Please login again.");
                    break;
                default:
                    alert(data.error || "Failed to update username. Please try again.")
            }

        } catch (error) {
            console.error(error);
            alert("Network error. Please check your connection.");
          } finally {
            setLoading(false);
          }        
    }

    return (
        <>
            <Popup
                modal
                overlayStyle={{ background: 'rgba(0, 0, 0, 0.5)' }}
                contentStyle={{
                    width: "400px",
                    height: "200px",
                    borderRadius: "10px",
                    padding: '20px'
                }}
                trigger={
                    <EditOutlinedIcon style={{ fontSize: "20px", marginLeft: 'auto', color: '#2563EB', cursor: "pointer" }} />
                }
                closeOnDocumentClick
            >
                {close => (
                    <div style={{ display: 'flex', justifyContent: "space-between", height: '100%' }}>
                        {!isEditingProfile ? (
                            <>
                                <div className='settings__container'>
                                    <div className="settings__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="set__head-title">Settings</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                        {/* Edit Your Profile */}
                                        <div
                                            className="setting"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setIsEditingProfile(true)}
                                        >
                                            <div id="edit" style={{ color: '#0A85D1' }}>Edit your Profile</div>
                                            <EastIcon style={{ width: "12px", height: "fit-content" }} sx={{
                                                '&': {
                                                    color: '#0A85D1'
                                                }
                                            }} />
                                        </div>

                                        {/* Get in Touch */}
                                        <div className="setting">
                                            <div id="contact" style={{ color: '#0A85D1' }}>Get in touch</div>
                                            <EastIcon style={{ width: "12px", height: "fit-content" }} sx={{
                                                '&': {
                                                    color: '#0A85D1'
                                                }
                                            }} />
                                        </div>

                                        {/* Logout */}
                                        <div className="setting"
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
                                        >
                                            <div id="contact" style={{ color: 'red' }}>Logout </div>
                                            <LogoutIcon style={{ width: "12px", height: "fit-content" }} sx={{
                                                '&': {
                                                    color: 'red'
                                                }
                                            }} />
                                        </div>
                                    </div>
                                </div>
                                <div className='settings__img'>
                                    <button onClick={close} style={{ cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '20px', marginLeft: 'auto' }}>×</button>
                                    <img src={SettingsImg} alt="" />
                                </div>
                            </>
                        ) : (
                            <div className='settings__container' style={{ width: '100%', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
                                <div className="settings__head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <button onClick={() => setIsEditingProfile(false)} style={{
                                        cursor: 'pointer',
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '13px',
                                        width: 'fit-content',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}>
                                        <WestIcon fontSize='13px'
                                            sx={{
                                                '&': {
                                                    color: '#0A85D1'
                                                }
                                            }}
                                        />
                                        <div style={{ color: '#0A85D1' }}>Back</div>
                                    </button>
                                    <button onClick={close} style={{ cursor: 'pointer', background: 'transparent', border: 'none', fontSize: '20px', width: 'fit-content' }}>×</button>
                                </div>
                                <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label htmlFor="username" style={{ fontWeight: 'bold', width: 'fit-content' }}>Change Username</label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Enter new username"
                                        style={{ padding: '8px', fontSize: '13px', borderRadius: '5px', border: '1px solid #ccc', width: '95% ' }}
                                    />
                                    <button
                                        onClick={handleProfileSubmit}
                                        disabled={loading}
                                        style={{
                                            padding: '10px',
                                            backgroundColor: '#2563EB',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {loading ? 'Saving...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* <div style={{ display: 'flex', justifyContent: "space-between", height: '100%' }}>
                    <div className='settings__container'>
                        <div className="settings__head">
                            <div className="set__head-title">Settings</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            <div className="setting">
                                <div id="edit" style={{ color: '#0A85D1' }}>Edit your Profile</div>
                                <EastIcon style={{ width: "12px", height: "fit-content" }} sx={{
                                    '&': {
                                        color: '#0A85D1'
                                    }
                                }} />
                            </div>
                            <div className="setting">
                                <div id="contact" style={{ color: '#0A85D1' }}>Get in touch</div>
                                <EastIcon style={{ width: "12px", height: "fit-content" }} sx={{
                                    '&': {
                                        color: '#0A85D1'
                                    }
                                }} />
                            </div>
                            <div className="setting"
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
                            >
                                <div id="contact" style={{ color: 'red' }}>Logout </div>
                                <LogoutIcon style={{ width: "12px", height: "fit-content" }} sx={{
                                    '&': {
                                        color: 'red'
                                    }
                                }} />
                            </div>

                        </div>
                    </div>
                    <div className='settings__img'>
                        <img src={SettingsImg} alt="" />
                    </div>
                </div> */}
            </Popup>
        </>
    );
}

export default Settings;
