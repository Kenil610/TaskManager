import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(''); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const { email, password } = formData;
        if (!email || !password) {
            return 'Both email and password are required.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address.';
        }
        return '';
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorMessage = validateForm();
        if (errorMessage) {
            setError(errorMessage);
            return;
        }

        const { email, password } = formData;

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                console.log('Login successful:', data);
                setError(''); 
                navigate('/');
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (error) {
            setError('Something went wrong. Please try again later.'); 
            console.error('Error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                {error && (
                    <div className="text-red-500 text-sm text-center mt-4">
                        {error}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="Email address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            <Link to="/forgotpassword">Forgot your password?</Link>
                        </Button>
                        <Button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            <Link to="/signup">Don't have an account? Sign up</Link>
                        </Button>
                    </div>
                    <Button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Login;
