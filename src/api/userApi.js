// userApi.js
// 회원가입, 로그인, 로그아웃 API 함수

const BASE_URL = 'https://peakdown.site/api';

export async function registerUser(data) {
    console.log('Register data:', data); // 디버깅을 위해 요청 데이터 출력
    try {
        // 서버의 CORS 정책 문제를 해결하기 위한 추가 헤더
        const res = await fetch(`${BASE_URL}/users/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Origin: window.location.origin,
            },
            credentials: 'include', // 쿠키 포함 (필요한 경우)
            body: JSON.stringify(data),
        });
        console.log('Response status:', res.status);
        console.log('Response headers:', Object.fromEntries([...res.headers]));

        const text = await res.text();
        console.log('Response text:', text);

        let jsonRes;
        try {
            jsonRes = text ? JSON.parse(text) : {};
            console.log('Register response:', jsonRes);
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            jsonRes = { error: 'Failed to parse server response' };
        }

        return jsonRes;
    } catch (error) {
        console.error('Network error:', error);
        return { error: 'Network error: ' + error.message };
    }
}

export async function loginUser(data) {
    try {
        const res = await fetch(`${BASE_URL}/users/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Origin: window.location.origin,
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const text = await res.text();
        let jsonRes;
        try {
            jsonRes = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            jsonRes = { error: 'Failed to parse server response' };
        }

        return jsonRes;
    } catch (error) {
        console.error('Network error:', error);
        return { error: 'Network error: ' + error.message };
    }
}

export async function logoutUser(refreshToken) {
    try {
        const res = await fetch(`${BASE_URL}/users/logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Origin: window.location.origin,
            },
            credentials: 'include',
            body: JSON.stringify({ refresh: refreshToken }),
        });

        const text = await res.text();
        let jsonRes;
        try {
            jsonRes = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            jsonRes = { error: 'Failed to parse server response' };
        }

        return jsonRes;
    } catch (error) {
        console.error('Network error:', error);
        return { error: 'Network error: ' + error.message };
    }
}

export async function updateNickname(nickname) {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            return { error: '로그인이 필요합니다.' };
        }

        const res = await fetch(`${BASE_URL}/users/nickname/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                Origin: window.location.origin,
            },
            credentials: 'include',
            body: JSON.stringify({ nickname }),
        });

        const text = await res.text();
        console.log('닉네임 업데이트 응답:', text); // 디버깅용

        let jsonRes;
        try {
            jsonRes = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Error parsing JSON response:', e);
            jsonRes = { error: 'Failed to parse server response' };
        }

        return jsonRes;
    } catch (error) {
        console.error('Network error:', error);
        return { error: 'Network error: ' + error.message };
    }
}
