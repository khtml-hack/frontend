import React, { createContext, useContext, useReducer } from 'react';

const RewardContext = createContext();

const initialState = {
    points: 0,
    pointHistory: [],
    loading: false,
    error: null,
};

const rewardReducer = (state, action) => {
    switch (action.type) {
        case 'SET_POINTS':
            return { ...state, points: action.payload };
        case 'ADD_POINTS':
            return {
                ...state,
                points: state.points + action.payload,
                pointHistory: [
                    {
                        id: Date.now(),
                        type: 'earn',
                        amount: action.payload,
                        description: action.description,
                        timestamp: new Date(),
                    },
                    ...state.pointHistory,
                ],
            };
        case 'USE_POINTS':
            return {
                ...state,
                points: state.points - action.payload,
                pointHistory: [
                    {
                        id: Date.now(),
                        type: 'use',
                        amount: action.payload,
                        description: action.description,
                        timestamp: new Date(),
                    },
                    ...state.pointHistory,
                ],
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export const RewardProvider = ({ children }) => {
    const [state, dispatch] = useReducer(rewardReducer, initialState);

    return <RewardContext.Provider value={{ ...state, dispatch }}>{children}</RewardContext.Provider>;
};

export const useReward = () => {
    const context = useContext(RewardContext);
    if (!context) {
        throw new Error('useReward must be used within a RewardProvider');
    }
    return context;
};
