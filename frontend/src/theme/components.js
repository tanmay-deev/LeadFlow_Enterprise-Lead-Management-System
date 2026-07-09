export const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8, // 0.5rem from design for general elements
        textTransform: 'none',
        fontWeight: 600,
        padding: '8px 16px',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:active': {
          transform: 'scale(0.97)',
        },
      },
      containedPrimary: {
        backgroundColor: '#2563eb', // primary-container
        color: '#eeefff', // on-primary-container
        '&:hover': {
          backgroundColor: '#1d4ed8',
          boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -2px rgba(37, 99, 235, 0.2)',
        },
      },
      outlined: {
        borderWidth: '1px',
        borderColor: '#434655', // outline-variant
        color: '#d4e4fa', // on-surface
        '&:hover': {
          borderWidth: '1px',
          borderColor: '#8d90a0',
          backgroundColor: '#1c2b3c', // surface-container-high
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12, // 0.75rem for larger containers
        backgroundColor: '#122131', // surface-container
        border: '1px solid #434655', // outline-variant
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        backgroundImage: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundColor: '#122131',
        backgroundImage: 'none',
        border: '1px solid #434655',
      },
      elevation1: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          backgroundColor: '#0d1c2d', // surface-container-low
          transition: 'all 0.2s ease-in-out',
          '& fieldset': {
            borderColor: '#434655', // outline-variant
          },
          '&:hover fieldset': {
            borderColor: '#8d90a0', // outline
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2563eb', // primary-container
            borderWidth: '1px',
            boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)', // inner glow effect
          },
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: '1px solid #434655', // outline-variant
        padding: '12px 16px', // tighter density
        color: '#d4e4fa',
      },
      head: {
        fontWeight: 600,
        backgroundColor: 'rgba(39, 54, 71, 0.3)', // surface-container-highest with opacity
        color: '#8d90a0', // outline
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontSize: '0.75rem',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.2s ease',
        '&:last-child td, &:last-child th': {
          borderBottom: 0,
        },
        '&.MuiTableRow-hover:hover': {
          backgroundColor: '#1c2b3c', // surface-container-high
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 4, // 0.25rem according to DESIGN.md
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        fontSize: '0.625rem', // 10px
        height: '24px', // smaller chips
      },
      filledPrimary: {
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        color: '#b4c5ff', // primary
      },
      filledSuccess: {
        backgroundColor: 'rgba(74, 225, 118, 0.1)',
        color: '#4ae176', // tertiary
      },
      filledError: {
        backgroundColor: 'rgba(255, 180, 171, 0.1)',
        color: '#ffb4ab', // error
      },
      filledWarning: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        color: '#FBBF24',
      },
      filledInfo: {
        backgroundColor: 'rgba(141, 144, 160, 0.2)',
        color: '#c3c6d7',
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
      },
    },
  },
};
