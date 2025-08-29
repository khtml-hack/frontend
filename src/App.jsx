import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Signup from './pages/Signup';
import NicknameSetup from './pages/NicknameSetup';
import Login from './pages/Login';
import OnboardingAddress from './pages/OnboardingAddress';
import FavoriteLocations from './pages/FavoriteLocations';
import TimeRecommendations from './pages/TimeRecommendations';
import RecommendationAccepted from './pages/RecommendationAccepted';
import MissionResult from './pages/MissionResult';
import PartnerStores from './pages/PartnerStores';
import StoreDetail from './pages/StoreDetail';
import QRUse from './pages/QRUse';
import PointHistory from './pages/PointHistory';
import MyPage from './pages/MyPage';
import Ranking from './pages/Ranking';
function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/nickname-setup" element={<NicknameSetup />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/onboarding/address" element={<OnboardingAddress />} />
                <Route path="/login" element={<Login />} />
                <Route path="/favorite-locations" element={<FavoriteLocations />} />
                <Route path="/time-recommendations" element={<TimeRecommendations />} />
                <Route path="/recommendation-accepted" element={<RecommendationAccepted />} />
                <Route path="/home" element={<Home />} />
                <Route path="/mission-result" element={<MissionResult />} />
                <Route path="/stores" element={<PartnerStores />} />
                <Route path="/stores/:id" element={<StoreDetail />} />
                <Route path="/qr-use" element={<QRUse />} />
                <Route path="/point-history" element={<PointHistory />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/ranking" element={<Ranking />} />
            </Routes>
        </div>
    );
}

export default App;
