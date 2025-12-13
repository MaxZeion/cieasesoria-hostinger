// i18n utility functions for multi-language support
import esTranslations from './translations/es.json';
import enTranslations from './translations/en.json';
import deTranslations from './translations/de.json';

// Supported locales
export const locales = ['es', 'en', 'de'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'es';

// Translation dictionaries
const translations: Record<Locale, typeof esTranslations> = {
    es: esTranslations,
    en: enTranslations,
    de: deTranslations,
};

// Language display names and flags
export const languageInfo: Record<Locale, { name: string; flag: string }> = {
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇬🇧' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
};

/**
 * Get the current locale from a URL pathname
 */
export function getLangFromUrl(url: URL): Locale {
    const [, lang] = url.pathname.split('/');
    if (locales.includes(lang as Locale)) {
        return lang as Locale;
    }
    return defaultLocale;
}

/**
 * Get translations for a specific locale
 */
export function useTranslations(lang: Locale) {
    return translations[lang] ?? translations[defaultLocale];
}

/**
 * Get a localized path for a given path and locale
 * For the default locale (es), returns path without prefix
 * For other locales, adds the locale prefix
 */
export function getLocalizedPath(path: string, lang: Locale): string {
    // Remove any existing locale prefix
    const cleanPath = path.replace(/^\/(es|en|de)/, '') || '/';

    // For default locale, don't add prefix
    if (lang === defaultLocale) {
        return cleanPath;
    }

    // For other locales, add prefix
    return `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Get the path without locale prefix
 */
export function getPathWithoutLocale(path: string): string {
    const match = path.match(/^\/(es|en|de)(\/.*)?$/);
    if (match) {
        return match[2] || '/';
    }
    return path;
}

/**
 * Get alternate language links for SEO (hreflang)
 */
export function getAlternateLinks(currentPath: string, baseUrl: string) {
    const pathWithoutLocale = getPathWithoutLocale(currentPath);

    return locales.map(locale => ({
        locale,
        href: `${baseUrl}${getLocalizedPath(pathWithoutLocale, locale)}`,
    }));
}
