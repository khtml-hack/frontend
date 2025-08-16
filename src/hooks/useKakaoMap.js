import { useEffect, useState } from 'react';

// 카카오맵 API를 로드하는 훅
export const useKakaoMap = () => {
    const [kakaoMapLoaded, setKakaoMapLoaded] = useState(false);

    useEffect(() => {
        // 이미 로드된 경우 바로 완료 처리
        if (window.kakao && window.kakao.maps) {
            setKakaoMapLoaded(true);
            return;
        }

        // 스크립트가 이미 로드 중인지 확인
        const script = document.getElementById('kakao-map-sdk');
        if (script) {
            // 로드 완료 시 처리
            script.addEventListener('load', () => {
                window.kakao.maps.load(() => {
                    setKakaoMapLoaded(true);
                });
            });
            return;
        }

        // API 키 가져오기
        const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
        if (!apiKey) {
            console.error('카카오맵 API 키가 설정되지 않았습니다.');
            return;
        }

        // 스크립트 생성
        const mapScript = document.createElement('script');
        mapScript.id = 'kakao-map-sdk';
        mapScript.async = true;
        // 장소 검색을 위한 라이브러리 추가
        mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;

        mapScript.addEventListener('load', () => {
            window.kakao.maps.load(() => {
                setKakaoMapLoaded(true);
            });
        });

        document.head.appendChild(mapScript);

        return () => {
            // 클린업 필요하면 추가
        };
    }, []);

    return kakaoMapLoaded;
};

// 카카오맵 장소 검색 함수 (현재 위치 기준)
export const searchPlace = (keyword, callback, userLocation = null) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error('카카오맵 API가 로드되지 않았습니다.');
        return;
    }

    const places = new window.kakao.maps.services.Places();

    // 검색 옵션 설정
    const options = {
        size: 15, // 검색 결과 개수 (최대 15개)
        sort: window.kakao.maps.services.Places.SORT_DISTANCE, // 거리순 정렬
    };

    // 사용자 위치가 제공된 경우, 해당 위치 기준으로 검색
    if (userLocation && userLocation.latitude && userLocation.longitude) {
        options.location = new window.kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
        options.radius = 20000; // 반경 20km 내에서 검색
    }

    places.keywordSearch(
        keyword,
        (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                callback(result);
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                callback([]);
            } else {
                console.error('카카오맵 검색 에러:', status);
                callback([]);
            }
        },
        options
    );
};

// 현재 위치를 가져오는 함수
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5분간 캐시
            }
        );
    });
};
