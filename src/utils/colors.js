export const DARK_THEME = {
    background: '#000000',
    surface: '#1A1A1A',
    primary: '#FF0000',
    textPrimary: '#FFFFFF',
    textSecondary: '#808080',
    border: '#333333',
    iconInactive: '#666666',
    iconActive: '#FF0000',
};

export const LIGHT_THEME = {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#FF0000',
    textPrimary: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    iconInactive: '#999999',
    iconActive: '#FF0000',
};

export const getColors = (isDark) => {
    return isDark ? DARK_THEME : LIGHT_THEME;
};
