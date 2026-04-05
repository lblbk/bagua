import { useState, useEffect } from 'react';

export function useTheme() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            const isDark = savedTheme ? savedTheme === 'dark' : themeMedia.matches;
            setIsDarkMode(isDark);
            document.documentElement.classList.toggle('dark', isDark);
        };

        applyTheme();

        const listener = (e) => {
            if (!localStorage.getItem('theme')) {
                setIsDarkMode(e.matches);
                document.documentElement.classList.toggle('dark', e.matches);
            }
        };

        themeMedia.addEventListener('change', listener);
        return () => themeMedia.removeEventListener('change', listener);
    }, []);

    const toggleDarkMode = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
    };

    return { isDarkMode, toggleDarkMode };
}