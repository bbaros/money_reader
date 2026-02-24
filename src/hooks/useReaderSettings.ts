import { useState, useEffect, useCallback } from 'react';

const SETTINGS_STORAGE_KEY = 'moneyStuffReaderSettings';

interface ReaderSettings {
    fontSize: number;
}

const DEFAULT_SETTINGS: ReaderSettings = {
    fontSize: 16,
};

export const useReaderSettings = () => {
    const [fontSize, setFontSize] = useState<number>(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                return parsedSettings.fontSize || DEFAULT_SETTINGS.fontSize;
            }
        } catch (error) {
            console.error('Failed to parse reader settings from localStorage', error);
        }
        return DEFAULT_SETTINGS.fontSize;
    });

    useEffect(() => {
        try {
            const settingsToStore: ReaderSettings = { fontSize };
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToStore));
        } catch (error) {
            console.error('Failed to save reader settings to localStorage', error);
        }
    }, [fontSize]);

    const increaseFontSize = useCallback(() => {
        setFontSize((prevSize) => prevSize + 1);
    }, []);

    const decreaseFontSize = useCallback(() => {
        setFontSize((prevSize) => Math.max(1, prevSize - 1)); // Prevent font size <= 0
    }, []);

    return {
        fontSize,
        increaseFontSize,
        decreaseFontSize,
    };
};
