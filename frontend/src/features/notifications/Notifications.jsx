import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, IconButton, CircularProgress, Chip } from '@mui/material';
import { NotificationsActive, CheckCircle, InfoOutlined } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications({ page: 1, per_page: 50 }),
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const notifications = data?.data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" color="text.primary">Notifications</Typography>
        {notifications.some(n => !n.is_read) && (
          <Button 
            variant="outlined" 
            startIcon={<CheckCircle />}
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      <Paper sx={{ overflow: 'hidden' }}>
        {notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <ListItem 
                key={notification.id} 
                divider={index !== notifications.length - 1}
                sx={{ 
                  bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
                secondaryAction={
                  !notification.is_read && (
                    <IconButton edge="end" title="Mark as read" onClick={() => readMutation.mutate(notification.id)}>
                      <CheckCircle color="primary" />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.is_read ? 'text.secondary' : 'primary.main' }}>
                    <NotificationsActive />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                        {notification.title}
                      </Typography>
                      {!notification.is_read && <Chip label="New" color="primary" size="small" sx={{ height: 20 }} />}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {notification.message}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InfoOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No notifications</Typography>
            <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;
