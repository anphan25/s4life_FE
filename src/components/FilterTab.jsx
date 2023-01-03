import { Tabs, Tab, Box, styled } from '@mui/material';
import React from 'react';

const TabsContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVertical',
})(({ theme, isVertical }) => ({
  margin: '24px 30px',
  '& .MuiTabs-indicator': {
    height: '4px',
    width: '4px',
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
            minWidth: 106,
            color: 'grey.900',
            fontWeight: 600,
            mb: 0.5,
            pl: props.orientation === 'vertical' ? 1.5 : 0,
          },
        }}
      >
        {tabs.map((tab, i) => (
          <Tab key={i} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
      {props.orientation !== 'vertical' && (
        <Box
          sx={{
            height: '4px',
            width: '100%',
            backgroundColor: 'grey.100',
            bottom: '4px',
            left: 0,
            borderRadius: '0.475rem',
            position: 'relative',
          }}
        />
      )}
    </TabsContainer>
  );
};
