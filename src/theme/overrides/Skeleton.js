export default function Skeleton(theme) {
  return {
    MuiSkeleton: {
      defaultProps: {
        animation: 'wave',
      },

      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[300],
        },
      },
    },
  };
}
