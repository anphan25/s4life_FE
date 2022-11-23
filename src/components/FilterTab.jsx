import { Tabs, Tab, Stack } from '@mui/material';

export const FilterTab = ({ tabs, sx, defaultValue, onChangeTab }) => {
  return (
    <Stack sx={sx}>
      <Tabs
        variant="scrollable"
        scrollButtons="auto"
        onChange={onChangeTab}
        value={defaultValue}
        sx={{ '& .MuiButtonBase-root': { borderRadius: '5px' } }}
      >
        {tabs.map((tab, i) => (
          <Tab sx={{ padding: '8px' }} key={i} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Stack>
  );
};
