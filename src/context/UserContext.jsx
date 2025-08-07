import React, { createContext, useContext, useReducer } from 'react';

const UserContext = createContext();

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const userReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
            };
        default:
            return state;
    }
};

export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return <UserContext.Provider value={{ ...state, dispatch }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
