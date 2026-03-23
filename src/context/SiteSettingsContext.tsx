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
}

export const defaultSiteSettings: SiteSettings = {
    site_name: 'Go Experts',
    site_tagline: 'Find verified experts. Get work done faster.',
    site_logo: '',
    site_favicon: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
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
                setSettings(res.data.settings);
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
