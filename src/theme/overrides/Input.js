export default function Input(theme) {
  return {
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFF',
          padding: '0',
          fontWeight: 400,
          borderRadius: '12px',
          border: `2px solid #D0D0D0`,
          '&.Mui-disabled': {
            '& svg': { color: theme.palette.grey[600] },
          },
          '&.Mui-focused': {
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
          '&.Mui-error': {
            border: `2px solid ${theme.palette.error.main}`,
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
          '& .MuiOutlinedInput-notchedOutline, & .Mui-hovered': {
            border: 'none',
          },
        },

        input: {
          outline: '0',
          padding: '12px !important',
          '&::placeholder': {
            opacity: 1,
            color: theme.palette.grey[600],
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFF',
        },
        underline: {
          '&&&:before': {
            borderBottom: 'none',
          },
          '&&:after': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFF',
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          },
          '&.Mui-focused': {
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.grey[200],
          },
        },
        underline: {
          '&:before': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderBottom: 'none',
          },
          borderRadius: '12px',
        },
      },
    },
  };
}
