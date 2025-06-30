import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "../style/signup.css"
import NavbarLanding from './NavbarLanding';
import UCL from "../imgs/ucl.png"
import SignupImg from "../imgs/login-img.png"
import SignupIconRev from "../imgs/signup-icon-rev.png"
import EastIcon from '@mui/icons-material/East';

const Login = () => {
    const [loginDetails, setLoginDetails] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginDetails({
            ...loginDetails,
            [name]: value
        });
    }

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    credentials: 'include', // 👈 important to send cookies
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                console.log(res);
                
                if (res.status === 200) {  
                    const data = res.json();
                    console.log(data);     
                    navigate('/dashboard');
                } 

                if (res.status === 500) {
                    console.error('Internal server error. Please try again later.');
                }
                else if (res.status === 401) {
                    navigate('/login');
                } 
            } catch (err) {
                console.error('Error checking session:', err);
            }
        };

        checkSession();
    }, [navigate]);


    const handleLogin = async(e) => {
    //   fetch ('http://localhost:5000/api/login', {
    //       method: 'POST',
    //       headers: {
    //           'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify(loginDetails),
    //       credentials: 'include'  
    //   })
    //   .then(response => {
    //       if (response.status === 401) {
    //           alert('Invalid credentials. Please try again.');
    //           return;
    //       }
    //       if (response.status === 404) {
    //           alert('User not found. Please sign up.');
    //           navigate('/signup');
    //           return;
    //       }
    //       if (response.status === 500) {
    //           console.error('Server error. Please try again later.');
    //           return;
    //       }
    //       if (response.status === 200) {
    //           console.log('Login successful');
    //           const data = response.json();
    //           console.log(data.token);
                    
    //         //   localStorage.setItem('token', data.token);
    //           navigate('/dashboard');
    //         //   return response.json();

    //       }
    //   })

    e.preventDefault();
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginDetails),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.status === 401) {
              alert('Invalid credentials. Please try again.');
              return;
          }
          if (response.status === 404) {
              alert('User not found. Please sign up.');
              navigate('/signup');
              return;
          }
          if (response.status === 500) {
              console.error('Server error. Please try again later.');
              return;
          }
          if (response.status === 200) {
              console.log('Login successful');
              console.log(data);
                    
              localStorage.setItem('token', data.token);
              navigate('/dashboard');
              return

          }
    } catch (error) {
        console.error('Login error:', error);
    }


    };

    const loginData = [
        {
            title: "Email Address",
            placeholder: "xyz..@ucl.ac.uk",
            value: loginDetails.email,
            id: "email",
            type: "email"
        },
        {
            title: "Password",
            placeholder: "Type password here...",
            value: loginDetails.password,
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
                            <div>Ready, set... Integrate</div>
                            {/* <img src={UCL} width={100} height={20} /> */}
                        </div>
                        <div className="title">Log into the Mathlete integration contest</div>
                    </div>
                    <div className="head__signup-img">
                        <img src={SignupImg} width={175} style={{transform: "translateY(-11px)"}} />
                    </div>
                </div>
                <div className="main" style={{height: '400px', justifyContent: "center"}}>
                    <div className='main__head'>
                        <div>
                            <img src={SignupIconRev} height={40} />
                        </div>
                        <div id="main-head__signup">Log In</div>
                        <div style={{ width: '40px' }}></div>
                    </div>
                    <div className='inputs'>
                    {loginData.map((field, index) => (
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
                        <button id="signup__button-signup" onClick={handleLogin}>
                            <div>Login</div>
                            <EastIcon style={{fontSize: '13px'}} />
                        </button>
                    </div>
                    {/* <div className="terms-conditions" style={{width: "30vw"}}></div> */}
                </div>
            </div>
            <div style={{ height: '10%' }}></div>
        {/* <h2>Login</h2>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={loginDetails.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={loginDetails.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" onClick={handleLogin}>Login</button> */}

      </div> 
    );
  };
  
  export default Login;
  