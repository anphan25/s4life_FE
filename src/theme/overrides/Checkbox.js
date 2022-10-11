import {
  CheckboxIcon,
  CheckboxCheckedIcon,
  CheckboxIndeterminateIcon,
} from "./CustomIcons";

export default function Checkbox(theme) {
  return {
    MuiCheckbox: {
      defaultProps: {
        icon: <CheckboxIcon />,
        checkedIcon: <CheckboxCheckedIcon />,
        indeterminateIcon: <CheckboxIndeterminateIcon />,
      },

      styleOverrides: {
        root: {
          padding: theme.spacing(1),
          "&.Mui-checked.Mui-disabled, &.Mui-disabled": {
            color: theme.palette.grey[200],
          },
          "& .MuiSvgIcon-fontSizeMedium": {
            width: 24,
            height: 24,
          },
          "& .MuiSvgIcon-fontSizeSmall": {
            width: 16,
            height: 16,
          },
          svg: {
            fontSize: 24,
            "&[font-size=small]": {
              fontSize: 16,
            },
          },
        },
      },
    },
  };
}
