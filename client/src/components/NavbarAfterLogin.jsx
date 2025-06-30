import React from 'react';
import '../style/navbarafterlogin.css'; // Create a CSS file for styling
import MathleteLogo from '../imgs/mathletelogo.png'; // Adjust the path as necessary
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useNavigate } from 'react-router-dom';

const NavbarAfterLogin = () => {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div>
                <img 
                    src={MathleteLogo} 
                    alt="MathleteLogo" 
                    width={200} 
                    onClick={() => navigate('/')} 
                    style={{ cursor: 'pointer' }}
                />
            </div>
            <div>
                <SettingsOutlinedIcon style={{fontSize: '30px'}}/>
            </div>
        </nav>
    );
};

export default NavbarAfterLogin;