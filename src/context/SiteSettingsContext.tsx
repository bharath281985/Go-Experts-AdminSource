import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export interface SiteSettings {
    site_name: string;
    site_tagline: string;
    site_logo: string;
    site_favicon: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    startup_nda_template: string;
}

export const defaultSiteSettings: SiteSettings = {
    site_name: 'Go Experts',
    site_tagline: 'Find verified experts. Get work done faster.',
    site_logo: '',
    site_favicon: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    startup_nda_template: '',
};

interface ContextType {
    settings: SiteSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<ContextType>({
    settings: defaultSiteSettings,
    loading: true,
    refreshSettings: async () => {},
});

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/cms/settings');
            if (res.data.success && res.data.settings) {
                const s = res.data.settings;
                setSettings(s);

                // Update Title & Favicon dynamically
                document.title = `${s.site_name || 'Go Experts'} Admin Panel`;
                
                if (s.site_favicon) {
                    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
                    link.type = 'image/png';
                    link.href = s.site_favicon.startsWith('http') ? s.site_favicon : `${base}${s.site_favicon.startsWith('/') ? s.site_favicon : '/' + s.site_favicon}`;
                } else {
                    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.removeAttribute('type');
                    link.href = 'data:,';
                }
            }
        } catch (err) {
            console.error('Failed to fetch site settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => useContext(SiteSettingsContext);
