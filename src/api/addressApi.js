// 집 주소 관리 API
const BASE_URL = 'https://peakdown.site/api';

export async function patchUserAddress(address) {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            return { error: '로그인이 필요합니다.' };
        }
        const res = await fetch(`${BASE_URL}/users/me/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
                Origin: window.location.origin,
            },
            credentials: 'include',
            body: JSON.stringify({ address }),
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
