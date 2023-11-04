import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './App.css';

export const Login = () => {
    const [pass, setPass] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Initialize the navigate function

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('http://localhost:3000/api/auth/login', {
            username: username,
            password: pass
        })
        .then((response) => {
            // Handle success
            const token = response.data.token;

            // Store the token in localStorage
            localStorage.setItem('token', token);
            console.log('Login successful:', response.data);

            // Redirect to another page after successful login
            navigate('/dashboard'); // Change '/dashboard' to the desired route
        })
        .catch((error) => {
            // Handle error
            console.error('Error logging in:', error);
        });
    }

    const handleCustomLogin = () => {
        window.location.replace('http://localhost:3000/api/auth/google')
      }

    return (
        <div className="auth-form-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" id="username" name="username" />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <button
  type="submit"
  style={{
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  }}
>
  Log In
</button>

            </form>
            <div style={{ marginTop: '8px' }}></div>
            <button
                onClick={handleCustomLogin}
                style={{
                    backgroundColor: 'white',
                    color: '#000000',
                    padding: '10px 20px',
                    border: '1px solid #A9A9A9',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                }}
                >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google Logo"
                    style={{ marginRight: '10px', width: '30px', height: '30px' }}
                />
                Sign in with Google
            </button>

            <button className="link-btn" onClick={() => navigate('/register')}>Don't have an account? Register here.</button>
        </div>
    )
}

export default Login;
