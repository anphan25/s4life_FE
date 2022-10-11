import { StarIcon } from "./CustomIcons";

const ICON_SMALL = { width: 16, height: 16 };
const ICON_LARGE = { width: 24, height: 24 };

export default function Rating(theme) {
  return {
    MuiRating: {
      defaultProps: {
        emptyIcon: <StarIcon />,
        icon: <StarIcon />,
      },

      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            opacity: 0.48,
          },
        },
        //iconEmpty: { color: theme.palette.grey[500_48] },
        sizeSmall: { "& svg": { ...ICON_SMALL } },
        sizeLarge: { "& svg": { ...ICON_LARGE } },
      },
    },
  };
}
