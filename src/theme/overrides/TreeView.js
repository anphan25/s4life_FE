import {
  TreeViewCollapseIcon,
  TreeViewExpandIcon,
  TreeViewEndIcon,
} from "./CustomIcons";

export default function TreeView(theme) {
  return {
    MuiTreeView: {
      defaultProps: {
        defaultCollapseIcon: (
          <TreeViewCollapseIcon sx={{ width: 24, height: 24 }} />
        ),
        defaultExpandIcon: (
          <TreeViewExpandIcon sx={{ width: 24, height: 24 }} />
        ),
        defaultEndIcon: <TreeViewEndIcon sx={{ width: 24, height: 24 }} />,
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        label: { ...theme.typography.body2 },
        iconContainer: { width: "auto" },
      },
    },
  };
}
