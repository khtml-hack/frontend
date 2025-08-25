const RAW_BASE = import.meta.env.VITE_API_BASE_URL || 'https://peakdown.site/';

const BASE = RAW_BASE.replace(/\/+$/, '');
const ENDPOINT = `${BASE}/api/users/nickname/`; // PATCH 엔드포인트(끝 슬래시 중요)

export async function patchNickname(nickname, token) {
    const res = await fetch(ENDPOINT, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nickname }),
        // 쿠키 인증이면 다음 줄 주석 해제:
        // credentials: 'include',
    });

    let data = null;
    try {
        data = await res.json();
    } catch {}

    if (!res.ok) {
        const msg = data?.message || data?.detail || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return data || { nickname };
}
