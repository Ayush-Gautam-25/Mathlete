import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarLanding from './NavbarLanding';
import "../style/signup.css"
import UCL from "../imgs/ucl.png"
import SignupImg from "../imgs/signup-img.png"
import SignupIconRev from "../imgs/signup-icon-rev.png"
import EastIcon from '@mui/icons-material/East';


const Signup = () => {
    const [userDetails, setUserDetails] = useState({
        username: '',
        email: '',
        university: 'UCL',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserDetails({
            ...userDetails,
            [name]: value
        });
    };

    const handleSubmit = () => {
        console.log(userDetails);
        fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(userDetails),
            credentials: 'include' // 👈 important to send cookies
        })
        .then(response => {
            console.log("Response from server:", response);
            
            if (response.status === 400) {
                alert('User already exists. Please log in.');
                navigate('/login');
                return;
            }
            if (response.status === 500) {
                console.error('Server error. Please try again later.');
                return;
            }
            if (response.status === 201) {
                console.log('User created successfully');

                
                navigate('/dashboard');
            }
            if (response.status === 401) {
                alert("Enter Valid Credentials")
            }
            return response.json();
        })
        .then(data => {
            console.log('User Data', data);
            localStorage.setItem('token', data.token);
            console.log('Token set!! Signup');
        })
        .catch(error => {
            console.log("Error registering user:", error);
        });
    };

    const signupData = [
        {
            title: 'Username',
            placeholder: "Type username here...",
            value: userDetails.username,
            id: "username",
            type: "text"
        },
        {
            title: "Email Address",
            placeholder: "xyz..@ucl.ac.uk",
            value: userDetails.email,
            id: "email",
            type: "email"
        },
        {
            title: "Password",
            placeholder: "Type password here...",
            value: userDetails.password,
            id: "password",
            type: "password"
        }
    ]

    return (
        <div className='signup__container'>
            <NavbarLanding />
            <div className='signup__content'>
                <div className="head">
                    <div className="head__quote_ucl-title">
                        <div id="quote_ucl">
                            <div>Think it. Solve it.</div>
                            <img src={UCL} width={100} height={20} />
                        </div>
                        <div className="title">Welcome to the Mathlete Integration Contest</div>
                    </div>
                    <div className="head__signup-img">
                        <img src={SignupImg} width={150} />
                    </div>
                </div>
                <div className="main" style={{gap: "50px"}}>
                    <div className='main__head'>
                        <div>
                            <img src={SignupIconRev} height={40} />
                        </div>
                        <div id="main-head__signup">Sign Up</div>
                        <div style={{ width: '40px' }}></div>
                    </div>
                    <div className='inputs'>
                    {signupData.map((field, index) => (
                        <div className='main__inputs' key={index}>
                            <label id={field.id} htmlFor={field.id}>{field.title} *</label>
                            <input
                                type={field.type}
                                id={field.id}
                                name={field.id}
                                value={field.value}
                                placeholder={field.placeholder}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                    </div>
                    <div>
                        <button id="signup__button-signup" onClick={handleSubmit}>
                            <div>Sign Up</div>
                            <EastIcon style={{fontSize: '13px'}} />
                        </button>
                    </div>
                    <div className="terms-conditions">By clicking “Sign Up →” above, you acknowledge that you have read and understood, and agree to Mathlete's Terms & Conditions and Privacy Policy.</div>
                </div>
            </div>
            <div style={{ height: '10%' }}></div>
        </div>
    );
};

export default Signup;
