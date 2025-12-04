'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ko from '../locales/ko.json';
import en from '../locales/en.json';

type Locale = 'ko' | 'en';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = { ko, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ko');

    useEffect(() => {
        // Load saved locale from localStorage
        const saved = localStorage.getItem('locale') as Locale;
        if (saved && (saved === 'ko' || saved === 'en')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: TranslationValue = translations[locale];

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }

        if (typeof value !== 'string') {
            console.warn(`Translation key is not a string: ${key}`);
            return key;
        }

        // Replace parameters like {count} with actual values
        if (params) {
            return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
                return params[paramKey]?.toString() ?? `{${paramKey}}`;
            });
        }

        return value;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
