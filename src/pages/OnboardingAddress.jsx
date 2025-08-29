import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKakaoMap, searchPlace, getCurrentLocation } from '../hooks/useKakaoMap';
import { registerUser } from '../api/userApi';

const OnboardingAddress = () => {
    const navigate = useNavigate();
    const kakaoMapLoaded = useKakaoMap();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            const pending = JSON.parse(localStorage.getItem('pendingSignup') || '{}');
            if (!pending.email || !pending.password || !pending.password_confirm) {
                navigate('/signup');
                return;
            }
            setEmail(pending.email);
            setUsername(pending.username || pending.email?.split('@')[0] || '');
            setPassword(pending.password);
            setPasswordConfirm(pending.password_confirm);
        } catch (e) {
            navigate('/signup');
        }
    }, [navigate]);

    const handlePlaceSearch = () => {
        if (!searchKeyword.trim()) return;
        if (!kakaoMapLoaded) {
            alert('카카오맵을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        setIsSearching(true);
        setSearchResults([]);
        searchPlace(
            searchKeyword,
            (results) => {
                const converted = results.map((place) => ({
                    id: place.id,
                    name: place.place_name,
                    address: place.address_name || place.road_address_name,
                    roadAddress: place.road_address_name,
                    x: parseFloat(place.x),
                    y: parseFloat(place.y),
                }));
                setSearchResults(converted);
                setIsSearching(false);
            }
        );
    };

    const handleCurrentLocation = async () => {
        try {
            setIsSearching(true);
            const loc = await getCurrentLocation();
            if (kakaoMapLoaded && window.kakao && window.kakao.maps) {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.coord2Address(loc.longitude, loc.latitude, (result, status) => {
                    setIsSearching(false);
                    if (status === window.kakao.maps.services.Status.OK) {
                        const address = result[0].address;
                        setSelectedAddress({
                            id: 'current',
                            name: '현재 위치',
                            address: address.address_name,
                            roadAddress: result[0].road_address
                                ? result[0].road_address.address_name
                                : address.address_name,
                            x: loc.longitude,
                            y: loc.latitude,
                        });
                    } else {
                        setSelectedAddress({
                            id: 'current',
                            name: '현재 위치',
                            address: `위도: ${loc.latitude.toFixed(6)}, 경도: ${loc.longitude.toFixed(6)}`,
                            x: loc.longitude,
                            y: loc.latitude,
                        });
                    }
                });
            }
        } catch (e) {
            setIsSearching(false);
            alert('현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        }
    };

    const canSubmit = !!selectedAddress && !isSearching;

    const handleSubmit = async () => {
        if (!selectedAddress) return;
        setError('');
        const payload = {
            email,
            username: username || email.split('@')[0],
            password,
            password_confirm: passwordConfirm,
            address: selectedAddress.address,
            address_lat: Math.round(parseFloat(selectedAddress.y) * 1000000) / 1000000,
            address_lng: Math.round(parseFloat(selectedAddress.x) * 1000000) / 1000000,
        };
        const res = await registerUser(payload);
        if (res && res.success && res.user) {
            if (res.access) {
                localStorage.setItem('accessToken', res.access);
                localStorage.setItem('refreshToken', res.refresh);
            }
            localStorage.removeItem('pendingSignup');
            navigate('/onboarding');
        } else if (res && res.errors) {
            setError(Object.values(res.errors).flat().join(' '));
        } else if (res && res.error) {
            setError(res.error);
        } else {
            setError('가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="mobile-frame">
            <div className="flex flex-col h-full px-8 pt-20">
                <div className="flex-1">
                    <h1 className="text-2xl font-medium text-left mb-6 text-black">집 주소 등록</h1>
                    <p className="text-sm text-gray-600 mb-6">회원가입을 완료하려면 집 주소를 등록해주세요.</p>

                    <div className="mb-4">
                        <div className="bg-white border rounded-2xl p-4 flex items-center gap-3" style={{ borderColor: '#c8c8c8' }}>
                            <input
                                type="text"
                                placeholder="주소로 검색"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
                                className="w-full bg-transparent text-gray-900 placeholder-gray-400 text-base outline-none"
                            />
                            <button onClick={handlePlaceSearch} className="text-gray-700 px-3 py-1 rounded-lg bg-gray-100">검색</button>
                        </div>
                        <button onClick={handleCurrentLocation} className="w-full mt-3 bg-gray-800 text-white py-3 rounded-xl font-medium">
                            📍 현재 위치로 찾기
                        </button>
                    </div>

                    {isSearching && <div className="text-center text-sm text-gray-500 mb-4">검색 중...</div>}

                    {searchResults.length > 0 && (
                        <div className="mb-4 max-h-60 overflow-y-auto bg-white border rounded-xl" style={{ borderColor: '#e5e7eb' }}>
                            {searchResults.map((r) => (
                                <div key={r.id} onClick={() => setSelectedAddress(r)} className={`p-3 border-b cursor-pointer ${selectedAddress?.id === r.id ? 'bg-gray-100' : ''}`} style={{ borderColor: '#f1f5f9' }}>
                                    <div className="text-gray-900 font-medium">{r.name}</div>
                                    <div className="text-gray-500 text-sm">{r.address}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedAddress && (
                        <div className="mb-4 p-4 bg-gray-50 border rounded-xl" style={{ borderColor: '#e5e7eb' }}>
                            <div className="text-gray-900 font-medium mb-1">선택된 주소</div>
                            <div className="text-gray-700 text-sm">{selectedAddress.address}</div>
                        </div>
                    )}

                    {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
                </div>

                <button onClick={handleSubmit} disabled={!canSubmit} className={`w-full py-4 rounded-2xl text-xl font-medium mb-8 ${canSubmit ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-200'}`}>
                    주소 등록하고 가입 완료
                </button>
            </div>
        </div>
    );
};

export default OnboardingAddress;


