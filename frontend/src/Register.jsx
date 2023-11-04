import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './App.css';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Initialize the navigate function

    const handleSubmit = (e) => {
        e.preventDefault();
        
        axios.post('http://localhost:3000/api/auth/register', {
            username: username,
            password: pass,
            email: email,
            displayName: name
        })
        .then((response) => {
            // Handle success
            const token = response.data.token;

            // Store the token in localStorage
            localStorage.setItem('token', token);
            console.log('Registration successful:', response.data);

            // Redirect to another page after successful registration
            navigate('/dashboard'); // Change '/dashboard' to the desired route
        })
        .catch((error) => {
            // Handle error
            console.error('Error registering:', error);
        });
    }

    return (
        <div className="auth-form-container">
            <h2>Sign Up</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" id="username" name="username" />
                <label htmlFor="name">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)}  name="name" id="name" placeholder="full name" />
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="example@domain.com" id="email" name="email" />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" />
                <button type="submit">Sign Up</button>
            </form>
            <button className="link-btn" onClick={() => navigate('/login')}>Already have an account? Login here.</button>
        </div>
    )
}
