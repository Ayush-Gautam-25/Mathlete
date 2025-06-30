import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingImg from "../imgs/landing-img.png"
import '../style/landing.css'; // Assuming you have a CSS file for styling

import EastIcon from '@mui/icons-material/East';
import NavbarLanding from './NavbarLanding';
import UCL from "../imgs/ucl.png"
import SignupIcon from "../imgs/signup-icon.png"
const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className='landing__container'>
            <NavbarLanding />
            <div className="landing__body">
                <div className='body__img'>
                    <img src={LandingImg} alt="" width={200} />
                </div>
                <div className="body__font" id="mathlete-io">Mathlete.io</div>
                <div className="body__font" id="integration-content">Integration Contest</div>
                <div className="body__font" id="paragraph_ucl">
                    <div>One month, unlimited integrals. Let’s integrate together! How many can you do? Sign up below. <EastIcon style={{fontSize: '12px'}} id="para-icon" /></div>
                    <img src={UCL} width={100} height={20} />
                </div>
                <div className="body__font" id="more-info">
                    <div style={{color: '#0A85D1'}}>More Information</div> <EastIcon style={{ color: '#0A85D1', fontSize: '12px'}} />
                </div>
                <div className="body__font buttons">
                    <button id="button-signup" onClick={() => navigate('/signup')}>
                        <img src={SignupIcon} style={{width: '12px'}} alt="" />
                        <div>Signup</div>
                    </button>
                    <button  id="button-login" onClick={() => navigate('/login')}>
                        <div>Login</div> 
                        <EastIcon style={{fontSize: '12px'}}/>
                    </button>
                </div>
            </div>
            <div className='landing__copyright'>© 2025 Mathlete.io</div>
        </div>
    );
  };

export default Landing;