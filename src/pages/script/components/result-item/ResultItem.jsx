import { Box, Stack, Typography } from '@mui/material';
import { Icon } from 'components';
import moment from 'moment';
import React, { useState } from 'react';
import { ResultItemContainer, Tag } from './ResultItemStyle';

const ResultItem = ({ item, index }) => {
  const [showItem, setShowItem] = useState(false);

  return (
    <ResultItemContainer onClick={() => setShowItem(!showItem)}>
      <Stack direction={'row'} gap="30px" justifyContent={'space-between'}>
        <Stack direction={'row'} gap="12px">
          <Typography fontSize={15} fontWeight={500}>
            {++index}. {item.username} - {item.action}
          </Typography>

          <Tag sx={{ color: `${item.type}.main`, backgroundColor: `${item.type}.light` }}>
            {item.type === 'success' ? 'Thành công' : 'Thất bại'}
          </Tag>
        </Stack>
        <Icon
          icon="solid-angle-down-small"
          sx={{ transform: showItem ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}
        />
      </Stack>
      {showItem && (
        <Box>
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
              <Typography fontSize={14} color="grey.900">
                Tên sự kiện: {item.event.eventName}
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
              <Typography fontSize={14} color="grey.900">
                Mã sự kiện: {item.event.eventCode}
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
              <Typography fontSize={14} color="grey.900">
                Ngày lấy máu: {moment(item.event.participationDate).format('DD MMMM YYYY HH:mm')}
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
              <Typography fontSize={14} color="grey.900">
                Ghi chú: {item.message}
              </Typography>
            </Stack>
            {item.status && (
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
                <Typography fontSize={14} color="grey.900">
                  Trạng thái lấy máu: {item.status === 1 ? 'Lấy máu thành công' : 'Lấy máu thất bại'}
                </Typography>
              </Stack>
            )}
            {item.note && (
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
                <Typography fontSize={14} color="grey.900">
                  Lí do từ chối: {item.note}
                </Typography>
              </Stack>
            )}
            {item.donationVolume && (
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
                <Typography fontSize={14} color="grey.900">
                  Số lượng máu hiến {item.donationVolume}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      )}
    </ResultItemContainer>
  );
};

export default ResultItem;
