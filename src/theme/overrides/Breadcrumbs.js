export default function Breadcrumbs(theme) {
  return {
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          marginLeft: theme.spacing(1.5),
          marginRight: theme.spacing(1.5),
        },
      },
    },
  };
}
