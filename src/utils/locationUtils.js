// 위치 관련 유틸리티 함수들

// 두 좌표 간의 거리 계산 (미터 단위)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// 현재 위치 가져오기
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    });
};

// 위치 변화 감지
export const watchLocation = (callback, errorCallback) => {
    if (!navigator.geolocation) {
        errorCallback(new Error('Geolocation is not supported'));
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            callback({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
            });
        },
        errorCallback,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000,
        }
    );
};

// 위치 감시 중지
export const stopWatchingLocation = (watchId) => {
    if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
    }
};

// 주소를 좌표로 변환 (카카오맵 API 활용)
export const geocodeAddress = async (address) => {
    const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;

    try {
        const response = await fetch(
            `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
            {
                headers: {
                    Authorization: `KakaoAK ${KAKAO_API_KEY}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding failed');
        }

        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            const location = data.documents[0];
            return {
                lat: parseFloat(location.y),
                lng: parseFloat(location.x),
                address: location.address_name,
            };
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
};

// 출발지에서 벗어났는지 확인 (출발 감지)
export const hasLeftOrigin = (currentLat, currentLng, originLat, originLng, departureThreshold = 50) => {
    const distance = calculateDistance(currentLat, currentLng, originLat, originLng);
    return distance > departureThreshold;
};

// 목적지에 도착했는지 확인
export const hasArrivedAtDestination = (currentLat, currentLng, destLat, destLng, arrivalThreshold = 100) => {
    const distance = calculateDistance(currentLat, currentLng, destLat, destLng);
    return distance <= arrivalThreshold;
};
