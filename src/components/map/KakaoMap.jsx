import React, { useEffect, useRef } from 'react';

const KakaoMap = ({ originLocation, destinationLocation, currentLocation, currentStep, onMapLoad }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        // 카카오맵 스크립트 로드
        const loadKakaoMap = () => {
            if (window.kakao && window.kakao.maps) {
                initializeMap();
                return;
            }

            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
                import.meta.env.VITE_KAKAO_MAP_API_KEY
            }&autoload=false`;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    initializeMap();
                });
            };
            script.onerror = () => {
                console.error('카카오맵 스크립트 로드 실패');
            };
            document.head.appendChild(script);
        };

        const initializeMap = () => {
            if (!mapRef.current) {
                console.warn('지도 컨테이너가 준비되지 않았습니다.');
                return;
            }

            // 위치 정보가 유효한지 체크 (lat, lng가 있는지)
            const isValidLocation = (loc) => loc && typeof loc.lat === 'number' && typeof loc.lng === 'number';

            if (!isValidLocation(originLocation) || !isValidLocation(destinationLocation)) {
                console.warn('유효하지 않은 위치 정보:', {
                    originLocation,
                    destinationLocation,
                    originValid: isValidLocation(originLocation),
                    destValid: isValidLocation(destinationLocation),
                });
                return;
            }

            console.log('지도 초기화 시작:', { originLocation, destinationLocation, currentLocation });

            const options = {
                center: new window.kakao.maps.LatLng(
                    currentLocation?.lat || originLocation.lat,
                    currentLocation?.lng || originLocation.lng
                ),
                level: 6,
            };

            const map = new window.kakao.maps.Map(mapRef.current, options);
            mapInstanceRef.current = map;

            // 기존 마커 제거
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];

            // 출발지 마커
            console.log('출발지 마커 생성:', originLocation);
            const originMarker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(originLocation.lat, originLocation.lng),
                map: map,
            });

            // 출발지 인포윈도우
            const originInfoWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">🚩 출발: ${originLocation.address}</div>`,
            });
            originInfoWindow.open(map, originMarker);

            // 목적지 마커
            console.log('목적지 마커 생성:', destinationLocation);
            const destMarker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(destinationLocation.lat, destinationLocation.lng),
                map: map,
            });

            // 목적지 인포윈도우
            const destInfoWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">🎯 도착: ${destinationLocation.address}</div>`,
            });
            destInfoWindow.open(map, destMarker);

            markersRef.current.push(originMarker, destMarker);

            // 현재 위치 마커 (여행 중일 때)
            if (currentLocation && currentStep === 'traveling') {
                const currentMarker = new window.kakao.maps.Marker({
                    position: new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
                    map: map,
                    image: new window.kakao.maps.MarkerImage(
                        'data:image/svg+xml;base64,' +
                            btoa(`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="8" fill="#4285F4"/>
                                <circle cx="12" cy="12" r="3" fill="white"/>
                            </svg>
                        `),
                        new window.kakao.maps.Size(24, 24)
                    ),
                });

                const currentInfoWindow = new window.kakao.maps.InfoWindow({
                    content: '<div style="padding:5px;font-size:12px;color:#4285F4;">현재 위치</div>',
                });
                currentInfoWindow.open(map, currentMarker);

                markersRef.current.push(currentMarker);

                // 현재 위치로 지도 중심 이동
                map.setCenter(new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng));
            }

            // 경로 표시 (간단한 선으로)
            const linePath = [
                new window.kakao.maps.LatLng(originLocation.lat, originLocation.lng),
                new window.kakao.maps.LatLng(destinationLocation.lat, destinationLocation.lng),
            ];

            const polyline = new window.kakao.maps.Polyline({
                path: linePath,
                strokeWeight: 3,
                strokeColor: '#22C55E',
                strokeOpacity: 0.7,
                strokeStyle: 'solid',
            });

            polyline.setMap(map);

            // 지도 범위 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            bounds.extend(new window.kakao.maps.LatLng(originLocation.lat, originLocation.lng));
            bounds.extend(new window.kakao.maps.LatLng(destinationLocation.lat, destinationLocation.lng));
            if (currentLocation) {
                bounds.extend(new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng));
            }
            map.setBounds(bounds);

            if (onMapLoad) {
                onMapLoad(map);
            }
        };

        loadKakaoMap();

        return () => {
            // 컴포넌트 언마운트시 마커 정리
            markersRef.current.forEach((marker) => marker.setMap(null));
        };
    }, [originLocation, destinationLocation, currentLocation, currentStep]);

    return (
        <div
            ref={mapRef}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
            }}
        />
    );
};

export default KakaoMap;
