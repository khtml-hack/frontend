import { useState, useEffect } from 'react';
import { storeApi } from '../api/storeApi';

export const useStoreData = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await storeApi.getStores();
            setStores(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyStores = async (lat, lng, radius) => {
        setLoading(true);
        setError(null);
        try {
            const data = await storeApi.getNearbyStores(lat, lng, radius);
            setStores(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStoreById = async (id) => {
        try {
            const data = await storeApi.getStore(id);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const getStoreDiscounts = async (storeId) => {
        try {
            const data = await storeApi.getStoreDiscounts(storeId);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    return {
        stores,
        loading,
        error,
        fetchStores,
        fetchNearbyStores,
        getStoreById,
        getStoreDiscounts,
    };
};
