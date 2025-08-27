const API_BASE_URL = 'https://peakdown.site/api';

// 여행 추천 생성
export const getTripRecommendation = async (
    originAddress,
    destinationAddress,
    regionCode = '110000',
    arriveBy = null,
    token
) => {
    try {
        console.log('Getting trip recommendation:', {
            originAddress,
            destinationAddress,
            regionCode,
            arriveBy,
            arriveByType: typeof arriveBy,
        });

        const requestBody = {
            origin_address: originAddress,
            destination_address: destinationAddress,
            region_code: regionCode,
        };

        // arrive_by가 제공된 경우에만 추가
        if (arriveBy) {
            requestBody.arrive_by = arriveBy;
            console.log('Adding arrive_by to request:', arriveBy);
        }

        console.log('Final request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${API_BASE_URL}/trips/recommend/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Trip recommendation error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Trip recommendation success:', result);
        return result;
    } catch (error) {
        console.error('여행 추천 요청 오류:', error);
        throw error;
    }
};

// 여행 시작
export const startTrip = async (recommendationId, token) => {
    try {
        console.log('Starting trip with recommendation ID:', recommendationId);

        const response = await fetch(`${API_BASE_URL}/trips/start/${recommendationId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Start trip error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Start trip success:', result);
        return result;
    } catch (error) {
        console.error('여행 시작 오류:', error);
        throw error;
    }
};

// 여행 완료
export const arriveTrip = async (tripId, token) => {
    try {
        console.log('Completing trip with ID:', tripId);

        const response = await fetch(`${API_BASE_URL}/trips/arrive/${tripId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Arrive trip error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Arrive trip success:', result);
        return result;
    } catch (error) {
        console.error('여행 완료 오류:', error);
        throw error;
    }
};

// 여행 히스토리 조회
export const getTripHistory = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/history/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Trip history error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Trip history success:', result);
        return result;
    } catch (error) {
        console.error('여행 히스토리 조회 오류:', error);
        throw error;
    }
};

// 최적 출발시간 조회
export const getOptimalTime = async (windowHours = 2, currentTime, location, token) => {
    try {
        const params = new URLSearchParams();
        if (windowHours) params.append('window_hours', windowHours);
        if (currentTime) params.append('current_time', currentTime);
        if (location) params.append('location', location);

        const response = await fetch(`${API_BASE_URL}/trips/optimal-time/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Optimal time error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Optimal time success:', result);
        return result;
    } catch (error) {
        console.error('최적 출발시간 조회 오류:', error);
        throw error;
    }
};
