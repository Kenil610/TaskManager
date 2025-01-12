import React, { useState } from 'react'
import Button from './Button'

function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    const handleSendEmail = async (e) => {
        e.preventDefault()
        
        // Basic email validation
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setMessage({ 
                text: 'Please enter a valid email address', 
                type: 'error' 
            })
            return
        }

        setLoading(true)
        setMessage({ text: '', type: '' })

        try {
            const response = await fetch('http://localhost:5000/api/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setMessage({ 
                text: 'If an account exists with this email, you will receive password reset instructions.', 
                type: 'success' 
            })
            setEmail('') 

        } catch (error) {
            setMessage({ 
                text: 'An error occurred. Please try again later.', 
                type: 'error' 
            })
            console.error('Password reset error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-center text-2xl font-bold mb-4">
                    Send Mail
                </h1>
                <p className="text-center text-black text-sm mb-6">
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.
                </p>
                <form onSubmit={handleSendEmail}>
                    {message.text && (
                        <div className={`mb-4 p-3 rounded ${
                            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message.text}
                        </div>
                    )}
                    <input 
                        type="email" 
                        placeholder='Enter email' 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <Button 
                        className="group relative w-full flex justify-center mt-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Mail'}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword