import { Tabs, Tab, Box, styled } from '@mui/material';
import React from 'react';

const TabsContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVertical',
})(({ theme, isVertical }) => ({
  padding: '0.75rem 2.25rem 0',
  backgroundColor: !isVertical && theme.palette.grey[100],

  '& .MuiTabs-indicator': {
    height: '4px',
    borderRadius: '0.475rem',
    backgroundColor: theme.palette.primary.main,
    zIndex: 999,
    left: isVertical ? 0 : 'unset',
  },
}));

export const FilterTab = ({ tabs, sx, defaultValue, onChangeTab, ...props }) => {
  return (
    <TabsContainer isVertical={!!(props.orientation === 'vertical')}>
      <Tabs
        {...props}
        variant="scrollable"
        scrollButtons="auto"
        onChange={onChangeTab}
        value={defaultValue}
        sx={{
          float: props.orientation === 'vertical' ? 'left' : 'center',
          '& .MuiTab-root': {
            color: 'grey.900',
            fontWeight: 600,
            mb: 0.5,
            pl: props.orientation === 'vertical' ? 1.5 : 0,
            textAlign: props.orientation === 'vertical' ? 'left' : 'center',

            ':not(:last-of-type)': {
              mr: props.orientation === 'vertical' ? 0 : '40px',
            },
          },
        }}
      >
        {tabs.map((tab, i) => (
          <Tab key={i} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </TabsContainer>
  );
};
