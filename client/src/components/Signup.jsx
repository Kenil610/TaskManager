import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        const { name, email, password } = formData;
        if (!name || !email || !password) {
            return 'All fields are required.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address.';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters long.';
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

        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('User created:', data);
                setError('');
                navigate('/login');
            } else {
                setError(data.message || 'User Already Exists.');
            }
        } catch (error) {
            setError('Something went wrong. Please try again later.');
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Create your account
                        </h2>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm text-center mt-4">{error}</div>
                    )}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                required
                                placeholder="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <Input
                                label="Email address"
                                type="email"
                                required
                                placeholder="Email address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <Input
                                label="Password"
                                type="password"
                                required
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="text-center">
                            <Button
                                type="button"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                                <Link to="/login">Already have an account? Sign in</Link>
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Sign up
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
