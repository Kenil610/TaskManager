import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from './Button'
import Input from './Input';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setMessage({ text: 'Invalid reset link', type: 'error' })
            return
        }

        verifyToken()
    }, [token])

    const verifyToken = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/verify-reset-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            })

            if (!response.ok) {
                setMessage({ text: 'This reset link is invalid or has expired', type: 'error' })
            }
        } catch (error) {
            setMessage({ text: 'An error occurred. Please try again later.', type: 'error' })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (formData.password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters long', type: 'error' })
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' })
            return
        }

        setLoading(true)
        setMessage({ text: '', type: '' })

        try {
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: formData.password
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' })

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login')
            }, 2000)

        } catch (error) {
            setMessage({
                text: error.message || 'An error occurred. Please try again later.',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-center text-2xl font-bold mb-4">
                    Reset Your Password
                </h1>
                <form onSubmit={handleSubmit}>
                    {message.text && (
                        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}
                    <div className="mb-4">
                        <Input
                            label="New Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword