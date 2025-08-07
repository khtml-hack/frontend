const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const rewardApi = {
    // 포인트 내역 조회
    getPointHistory: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/rewards/history/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch point history');
        return response.json();
    },

    // 현재 포인트 조회
    getCurrentPoints: async (userId) => {
        const response = await fetch(`${API_BASE_URL}/rewards/points/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch current points');
        return response.json();
    },

    // 포인트 사용
    usePoints: async (userId, amount, storeId, description) => {
        const response = await fetch(`${API_BASE_URL}/rewards/use`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                amount,
                storeId,
                description,
            }),
        });
        if (!response.ok) throw new Error('Failed to use points');
        return response.json();
    },

    // QR 코드 생성
    generateQR: async (userId, amount) => {
        const response = await fetch(`${API_BASE_URL}/rewards/generate-qr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                amount,
            }),
        });
        if (!response.ok) throw new Error('Failed to generate QR code');
        return response.json();
    },

    // QR 코드 검증 및 사용
    verifyAndUseQR: async (qrCode, storeId) => {
        const response = await fetch(`${API_BASE_URL}/rewards/verify-qr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                qrCode,
                storeId,
            }),
        });
        if (!response.ok) throw new Error('Failed to verify QR code');
        return response.json();
    },
};
