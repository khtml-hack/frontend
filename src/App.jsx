import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import TimeRecommendations from './pages/TimeRecommendations';
import RecommendationAccepted from './pages/RecommendationAccepted';
import MissionResult from './pages/MissionResult';
import PartnerStores from './pages/PartnerStores';
import StoreDetail from './pages/StoreDetail';
import QRUse from './pages/QRUse';
import PointHistory from './pages/PointHistory';
import MyPage from './pages/MyPage';
import NicknameSetup from './pages/NicknameSetup';
import FavoriteLocations from './pages/FavoriteLocations';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/home" element={<Home />} />
                <Route path="/time-recommendations" element={<TimeRecommendations />} />
                <Route path="/recommendation-accepted" element={<RecommendationAccepted />} />
                <Route path="/mission-result" element={<MissionResult />} />
                <Route path="/stores" element={<PartnerStores />} />
                <Route path="/stores/:id" element={<StoreDetail />} />
                <Route path="/qr-use" element={<QRUse />} />
                <Route path="/point-history" element={<PointHistory />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/nickname-setup" element={<NicknameSetup />} />
                <Route path="/favorite-locations" element={<FavoriteLocations />} />
            </Routes>
        </div>
    );
}

export default App;
