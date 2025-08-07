import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MissionResult from './pages/MissionResult';
import PartnerStores from './pages/PartnerStores';
import StoreDetail from './pages/StoreDetail';
import QRUse from './pages/QRUse';
import PointHistory from './pages/PointHistory';
import MyPage from './pages/MyPage';
import Login from './pages/Login';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/mission-result" element={<MissionResult />} />
                <Route path="/stores" element={<PartnerStores />} />
                <Route path="/stores/:id" element={<StoreDetail />} />
                <Route path="/qr-use" element={<QRUse />} />
                <Route path="/point-history" element={<PointHistory />} />
                <Route path="/mypage" element={<MyPage />} />
            </Routes>
        </div>
    );
}

export default App;
