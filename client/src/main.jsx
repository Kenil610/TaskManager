import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import TaskBoardApp from './components/TaskBoardApp.jsx';
import Profile from './components/Profile.jsx';
import ResetPassword from './components/ResetPassword.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,  // Your main layout
    children: [
      {
        path: '/',       // Home page
        element: <TaskBoardApp />,
      },
      {
        path: '/login',       // Login page
        element: <Login />,
      },
      {
        path: '/signup',      // Signup page
        element: <Signup />,
      },
      {
        path: '/profile',  // Profile page
        element: <Profile />,
      },
      {
        path: '/forgotPassword',  // Forgot password page
        element: <ForgotPassword />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <RouterProvider router={router} />
  // </StrictMode>
);
