export const calculateMissionPoints = (missionType, difficulty, completionTime) => {
    const basePoints = {
        recycling: 100,
        walking: 50,
        public_transport: 80,
        energy_saving: 120,
        waste_reduction: 90,
        eco_shopping: 110,
    };

    const difficultyMultiplier = {
        easy: 1.0,
        medium: 1.5,
        hard: 2.0,
    };

    const timeBonus = completionTime < 30 ? 1.2 : 1.0; // 30분 이내 완료시 보너스

    const points = Math.floor((basePoints[missionType] || 100) * (difficultyMultiplier[difficulty] || 1.0) * timeBonus);

    return Math.max(points, 10); // 최소 10포인트 보장
};

export const calculateLevelFromPoints = (totalPoints) => {
    if (totalPoints < 500) return { level: 1, title: '환경 새싹' };
    if (totalPoints < 1500) return { level: 2, title: '환경 지킴이' };
    if (totalPoints < 3000) return { level: 3, title: '환경 전사' };
    if (totalPoints < 5000) return { level: 4, title: '환경 마스터' };
    if (totalPoints < 8000) return { level: 5, title: '환경 히어로' };
    return { level: 6, title: '환경 레전드' };
};

export const calculateDiscountAmount = (points, discountRate = 0.01) => {
    // 1포인트 = 1원 기본값 (discountRate로 조정 가능)
    return Math.floor(points * discountRate);
};

export const calculateQRExpiry = (createdAt, validMinutes = 10) => {
    const created = new Date(createdAt);
    const expiry = new Date(created.getTime() + validMinutes * 60000);
    return expiry;
};

export const isQRExpired = (createdAt, validMinutes = 10) => {
    const expiry = calculateQRExpiry(createdAt, validMinutes);
    return new Date() > expiry;
};

export const formatPoints = (points) => {
    if (points >= 10000) {
        return `${(points / 10000).toFixed(1)}만`;
    }
    if (points >= 1000) {
        return `${(points / 1000).toFixed(1)}천`;
    }
    return points.toLocaleString();
};
