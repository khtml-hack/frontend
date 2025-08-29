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

// 주소를 좌표로 변환 (카카오맵 JavaScript SDK 활용)
export const geocodeAddress = async (address) => {
    console.log('🔍 Geocoding 시작:', address);

    return new Promise((resolve, reject) => {
        // 카카오맵 SDK가 로드되어 있는지 확인
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            console.error('❌ 카카오맵 SDK가 로드되지 않았습니다.');
            reject(new Error('카카오맵 SDK가 로드되지 않았습니다.'));
            return;
        }

        // Geocoder 생성
        const geocoder = new window.kakao.maps.services.Geocoder();

        console.log('📡 카카오맵 Geocoder로 주소 검색:', address);

        // 주소로 좌표 검색
        geocoder.addressSearch(address, (result, status) => {
            console.log('📡 Geocoder 응답 상태:', status);
            console.log('📡 Geocoder 응답 결과:', result);

            if (status === window.kakao.maps.services.Status.OK) {
                if (result && result.length > 0) {
                    const location = result[0];
                    const coords = {
                        lat: parseFloat(location.y),
                        lng: parseFloat(location.x),
                        address: location.address_name || address,
                    };

                    console.log('✅ Geocoding 성공:', coords);
                    resolve(coords);
                } else {
                    console.warn('⚠️ 검색 결과가 없습니다:', address);
                    reject(new Error(`주소를 찾을 수 없습니다: ${address}`));
                }
            } else {
                console.error('❌ Geocoding 실패:', status, address);
                let errorMessage = '주소 검색 실패';

                switch (status) {
                    case window.kakao.maps.services.Status.ZERO_RESULT:
                        errorMessage = '검색 결과가 없습니다';
                        break;
                    case window.kakao.maps.services.Status.ERROR:
                        errorMessage = '검색 중 오류가 발생했습니다';
                        break;
                    default:
                        errorMessage = `알 수 없는 오류: ${status}`;
                }

                reject(new Error(`${errorMessage}: ${address}`));
            }
        });
    });
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
