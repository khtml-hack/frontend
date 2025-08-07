import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { RewardProvider } from './context/RewardContext.jsx';
import './styles/tailwind.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <UserProvider>
                <RewardProvider>
                    <App />
                </RewardProvider>
            </UserProvider>
        </BrowserRouter>
    </React.StrictMode>
);
