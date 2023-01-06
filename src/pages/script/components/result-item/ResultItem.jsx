import { Box, Stack, Typography } from '@mui/material';
import { Icon } from 'components';
import React, { useState } from 'react';
import { ResultItemContainer, Tag } from './ResultItemStyle';

const ResultItem = ({ item, index }) => {
  const [showItem, setShowItem] = useState(false);

  return (
    <ResultItemContainer onClick={() => setShowItem(!showItem)}>
      <Stack direction={'row'} gap="30px" justifyContent={'space-between'}>
        <Stack direction={'row'} gap="12px">
          <Typography fontWeight={500}>{++index}. Tên sự kiện hiến máu</Typography>
          <Tag sx={{ color: 'success.main', backgroundColor: 'success.light' }}>Thành công</Tag>
        </Stack>
        <Icon
          icon="solid-angle-down-small"
          sx={{ transform: showItem ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
        />
      </Stack>
      {showItem && (
        <Box>
          <Typography fontSize={14} fontWeight={600} color="primary.main">
            Thông tin sự kiện
          </Typography>
          <Stack direction={'column'} gap={2} sx={{ mt: 0.5, ml: 1.5 }}>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                Tên sự kiện
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                Mã sự kiện
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                Thời gian: 07 tháng 1, 2023 - 07 tháng 1, 2023 (08:00 - 17:00)
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                Loại sự kiện: Thông thường
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                50 người đã đăng kí
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                Thông tin liên hệ
              </Typography>
            </Stack>
            <Stack direction={'row'} alignItems="center">
              <Box
                sx={{
                  width: '8px',
                  height: '4px',
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: 'primary.main',
                  mr: '0.75rem',
                }}
              />
              <Typography fontSize={12} color="grey.600">
                Nhóm máu cần: tất cả
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}
    </ResultItemContainer>
  );
};

export default ResultItem;
