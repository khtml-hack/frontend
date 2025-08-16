const API_BASE_URL = 'https://peakdown.site/api';

// 저장된 경로 조회
export const getRoutes = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/routes/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('경로 조회 오류:', error);
        throw error;
    }
};

// 새 경로 저장
export const createRoute = async (routeData, token) => {
    try {
        console.log('Creating route with data:', routeData);
        console.log('Using token:', token ? 'Token exists' : 'No token');

        const response = await fetch(`${API_BASE_URL}/profiles/routes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(routeData),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('Create route success:', result);
        return result;
    } catch (error) {
        console.error('경로 생성 오류:', error);
        throw error;
    }
};

// 경로 수정
export const updateRoute = async (routeId, routeData, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/routes/${routeId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(routeData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('경로 수정 오류:', error);
        throw error;
    }
};

// 경로 삭제
export const deleteRoute = async (routeId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/routes/${routeId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // DELETE 요청은 일반적으로 내용이 없는 응답을 반환
        return response.status === 204 ? { success: true } : await response.json();
    } catch (error) {
        console.error('경로 삭제 오류:', error);
        throw error;
    }
};

// 특정 경로 조회
export const getRoute = async (routeId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/profiles/routes/${routeId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('경로 조회 오류:', error);
        throw error;
    }
};
