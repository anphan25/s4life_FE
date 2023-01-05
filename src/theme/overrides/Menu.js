export default function Menu(theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          margin: '12px',
          padding: '12px 16px',
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
