const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const missionApi = {
    // 미션 목록 조회
    getMissions: async () => {
        const response = await fetch(`${API_BASE_URL}/missions`);
        if (!response.ok) throw new Error('Failed to fetch missions');
        return response.json();
    },

    // 특정 미션 조회
    getMission: async (id) => {
        const response = await fetch(`${API_BASE_URL}/missions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch mission');
        return response.json();
    },

    // 미션 완료 제출
    completeMission: async (missionId, data) => {
        const response = await fetch(`${API_BASE_URL}/missions/${missionId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to complete mission');
        return response.json();
    },

    // 미션 인증 사진 업로드
    uploadMissionProof: async (missionId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('missionId', missionId);

        const response = await fetch(`${API_BASE_URL}/missions/upload-proof`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload proof');
        return response.json();
    },
};
