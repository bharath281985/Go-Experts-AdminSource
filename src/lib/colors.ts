// GoExperts Brand Color Palette
export const colors = {
  primary: {
    main: '#F24C20',
    hover: '#d43a12',
    light: 'rgba(242, 76, 32, 0.1)',
    lighter: 'rgba(242, 76, 32, 0.05)',
  },
  secondary: {
    main: '#044071',
    hover: '#033559',
    light: 'rgba(4, 64, 113, 0.1)',
    lighter: 'rgba(4, 64, 113, 0.05)',
  }
} as const;

// Tailwind className helpers
export const buttonClasses = {
  primary: 'bg-[#F24C20] hover:bg-[#d43a12] text-white',
  secondary: 'bg-[#044071] hover:bg-[#033559] text-white',
  primaryOutline: 'border-2 border-[#F24C20] text-[#F24C20] hover:bg-[#F24C20] hover:text-white',
  secondaryOutline: 'border-2 border-[#044071] text-[#044071] hover:bg-[#044071] hover:text-white',
};

export const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-[#F24C20]';
