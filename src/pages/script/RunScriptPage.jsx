import { Box, Button, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import { FilterTab, HeaderBreadcumbs, Icon } from 'components';
import React, { useState } from 'react';
import ResultItem from 'pages/script/components/result-item/ResultItem';
import { HeaderMainStyle, ResultContainer, RunContainer } from './RunScriptStyle';

const filterTabValues = [
  { label: 'Tất cả', value: 0 },
  { label: 'Thành công', value: 1 },
  { label: 'Thất bại', value: 2 },
];

const categoryList = [
  {
    name: 'Tạo sự kiện',
    value: 0,
  },
];

const RunScriptPage = () => {
  const [category, setCategory] = useState('');
  function runScript() {}

  const handleFilterTabChange = (e, value) => {};

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  return (
    <>
      <HeaderMainStyle>
        <HeaderBreadcumbs heading="Giả lập" links={[{ name: 'Trang chủ', to: '/' }, { name: 'Giả lập' }]} />
        <Stack direction={'row'} gap="12px">
          <Select
            renderValue={(selected) => {
              if (selected.length === 0) {
                return 'Chọn loại giả lập';
              }
              return categoryList[selected].name;
            }}
            sx={{ minWidth: 200 }}
            name={'category'}
            select
            value={category}
            onChange={handleCategoryChange}
            displayEmpty
          >
            <MenuItem disabled value="" sx={{ backgroundColor: 'white !important', mb: 1, pl: 0 }}>
              Chọn loại giả lập
            </MenuItem>
            {categoryList.map((category) => (
              <MenuItem sx={{ cursor: 'pointer', mb: 1, px: 3, py: 1.5 }} key={category.name} value={category.value}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          <Button
            sx={{ whiteSpace: 'nowrap' }}
            startIcon={<Icon icon="solid-play" />}
            variant="contained"
            onClick={runScript}
          >
            Chạy giả lập
          </Button>
        </Stack>
      </HeaderMainStyle>
      <Grid container spacing={2}>
        <Grid item md={5} sm={6} xs={12}>
          <RunContainer>
            <Stack direction={'column'} gap="12px" sx={{ overflow: 'auto' }}>
              {[...Array(50)].map((item, index) => (
                <div>
                  <Typography>{++index}. </Typography>
                  <Typography>[Đăng nhập] Bệnh viện chợ rẫy 2 - Manager 1</Typography>
                  <Typography>[Tạo sự kiện thông thường] Bệnh viện chợ rẫy 2 - Manager 1</Typography>
                </div>
              ))}
            </Stack>
          </RunContainer>
        </Grid>
        <Grid item md={7} sm={6} xs={12}>
          <ResultContainer>
            <Box sx={{ height: 'auto' }}>
              <FilterTab tabs={filterTabValues} onChangeTab={handleFilterTabChange} defaultValue={1} />
            </Box>
            <Stack direction={'column'} gap="12px" sx={{ overflow: 'auto', padding: '0 30px 30px' }}>
              {[...Array(50)].map((item, index) => (
                <ResultItem item={item} index={index} />
              ))}
            </Stack>
          </ResultContainer>
        </Grid>
      </Grid>
    </>
  );
};

export default RunScriptPage;
