export default function Menu(theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          margin: '8px',
          padding: '10px 14px',
          fontSize: 14,
          fontWeight: 500,
          borderRadius: 6,
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        },
      },
    },
  };
}
