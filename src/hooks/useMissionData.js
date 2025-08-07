import { useState, useEffect } from 'react';
import { missionApi } from '../api/missionApi';

export const useMissionData = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMissions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await missionApi.getMissions();
            setMissions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const completeMission = async (missionId, data) => {
        try {
            const result = await missionApi.completeMission(missionId, data);
            // 미션 목록 새로고침
            await fetchMissions();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const uploadProof = async (missionId, file) => {
        try {
            const result = await missionApi.uploadMissionProof(missionId, file);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    return {
        missions,
        loading,
        error,
        refetch: fetchMissions,
        completeMission,
        uploadProof,
    };
};
