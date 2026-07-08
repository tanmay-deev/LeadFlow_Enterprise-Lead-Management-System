import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../../../api/leadApi';
import { format } from 'date-fns';

const RecentLeads = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recentLeads'],
    queryFn: () => fetchLeads({ page: 1, per_page: 5 }),
  });

  const getStatusColor = (statusName) => {
    const map = {
      'New': 'info',
      'Contacted': 'warning',
      'Qualified': 'primary',
      'Won': 'success',
      'Lost': 'error'
    };
    return map[statusName] || 'default';
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  const leads = data?.data || [];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
          Recent Leads
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Contact Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{lead.contact_name}</TableCell>
                    <TableCell>{lead.company_name || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={lead.status?.name || 'Unknown'} 
                        color={getStatusColor(lead.status?.name)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{format(new Date(lead.created_at), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">No recent leads.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentLeads;
