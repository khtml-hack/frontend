import { useState, useEffect } from 'react';
import { rewardApi } from '../api/rewardApi';
import { useReward } from '../context/RewardContext';

export const useRewardData = (userId) => {
    const { dispatch } = useReward();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCurrentPoints = async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await rewardApi.getCurrentPoints(userId);
            dispatch({ type: 'SET_POINTS', payload: data.points });
        } catch (err) {
            setError(err.message);
            dispatch({ type: 'SET_ERROR', payload: err.message });
        } finally {
            setLoading(false);
        }
    };

    const fetchPointHistory = async () => {
        if (!userId) return;

        try {
            const data = await rewardApi.getPointHistory(userId);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const usePoints = async (amount, storeId, description) => {
        if (!userId) return;

        try {
            const result = await rewardApi.usePoints(userId, amount, storeId, description);
            dispatch({
                type: 'USE_POINTS',
                payload: amount,
                description,
            });
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const generateQR = async (amount) => {
        if (!userId) return;

        try {
            const result = await rewardApi.generateQR(userId, amount);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchCurrentPoints();
    }, [userId]);

    return {
        loading,
        error,
        fetchCurrentPoints,
        fetchPointHistory,
        usePoints,
        generateQR,
    };
};
