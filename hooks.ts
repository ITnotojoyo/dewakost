// FIX: Import `React` to make the `React` namespace available for type annotations.
import React, { useState, useEffect } from 'react';

function getStorageValue<T>(key: string, defaultValue: T | (() => T)): T {
    if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem(key);
        if (saved !== null && saved !== '') {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing JSON from localStorage", e);
            }
        }
    }
    if (defaultValue instanceof Function) {
        return defaultValue();
    }
    return defaultValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        return getStorageValue(key, initialValue);
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch(e) {
            console.error("Error saving to localStorage", e);
        }
    }, [key, value]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.storageArea === window.localStorage && e.key === key) {
                try {
                    if (e.newValue) {
                       setValue(JSON.parse(e.newValue));
                    } else {
                       const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;
                       setValue(defaultValue);
                    }
                } catch(e) {
                    console.error("Error parsing JSON from storage event", e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, initialValue]);

    return [value, setValue];
}