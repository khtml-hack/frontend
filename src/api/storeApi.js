const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const storeApi = {
    // 제휴 상점 목록 조회
    getStores: async () => {
        const response = await fetch(`${API_BASE_URL}/stores`);
        if (!response.ok) throw new Error('Failed to fetch stores');
        return response.json();
    },

    // 특정 상점 정보 조회
    getStore: async (id) => {
        const response = await fetch(`${API_BASE_URL}/stores/${id}`);
        if (!response.ok) throw new Error('Failed to fetch store');
        return response.json();
    },

    // 근처 상점 검색
    getNearbyStores: async (lat, lng, radius = 1000) => {
        const response = await fetch(`${API_BASE_URL}/stores/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
        if (!response.ok) throw new Error('Failed to fetch nearby stores');
        return response.json();
    },

    // 상점별 할인 정보 조회
    getStoreDiscounts: async (storeId) => {
        const response = await fetch(`${API_BASE_URL}/stores/${storeId}/discounts`);
        if (!response.ok) throw new Error('Failed to fetch store discounts');
        return response.json();
    },
};
