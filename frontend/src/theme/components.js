export const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        boxShadow: 'none',
        padding: '8px 16px',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        backgroundImage: 'none', // Remove MUI's default overlay on dark mode
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '16px',
        backgroundImage: 'none',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#020617', // Sidebar color
        borderRight: '1px solid #334155',
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: '#334155', // divider color
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: '#475569',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#3B82F6',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #334155',
        padding: '16px',
      },
      head: {
        fontWeight: 600,
        backgroundColor: '#0F172A',
        color: '#CBD5E1',
      },
    },
  },
};
