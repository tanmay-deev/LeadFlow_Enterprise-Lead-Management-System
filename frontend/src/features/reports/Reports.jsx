import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  TextField,
  Button
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchConversionReport, fetchAgentPerformance } from '../../api/reportApi';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress
} from '@mui/material';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fetchTrigger, setFetchTrigger] = useState(0); // Dummy state to trigger refetch

  const { data, isLoading } = useQuery({
    queryKey: ['conversionReport', { fetchTrigger }],
    queryFn: () => fetchConversionReport({ start_date: startDate, end_date: endDate }),
  });

  const { data: agentData, isLoading: isAgentLoading } = useQuery({
    queryKey: ['agentPerformance', { fetchTrigger }],
    queryFn: () => fetchAgentPerformance({ start_date: startDate, end_date: endDate }),
  });

  const report = data?.data || { 
    total_leads: 0, 
    won_leads: 0, 
    lost_leads: 0, 
    conversion_rate: 0,
    by_source: [] 
  };

  const handleFilter = () => {
    setFetchTrigger(prev => prev + 1);
  };

  const agentList = Array.isArray(agentData?.data) ? agentData.data : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Reports & Analytics
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField 
          label="Start Date" 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} 
          size="small" 
        />
        <TextField 
          label="End Date" 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} 
          size="small" 
        />
        <Button variant="contained" onClick={handleFilter}>
          Filter
        </Button>
      </Paper>

      <Grid container spacing={3}>
        <Grid xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Total Leads</Typography>
              <Typography variant="h3" sx={{ mt: 2 }}>{report.total_leads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Won Leads</Typography>
              <Typography variant="h3" sx={{ mt: 2 }}>{report.won_leads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'error.contrastText', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Lost Leads</Typography>
              <Typography variant="h3" sx={{ mt: 2 }}>{report.lost_leads}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText', height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Conversion Rate</Typography>
              <Typography variant="h3" sx={{ mt: 2 }}>{report.conversion_rate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mt: 5, mb: 3 }}>Agent Performance</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agent Name</TableCell>
              <TableCell align="center">Total Leads</TableCell>
              <TableCell align="center">Won Leads</TableCell>
              <TableCell align="right">Conversion Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isAgentLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : agentList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              agentList.map((agent) => (
                <TableRow key={agent.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{agent.name}</TableCell>
                  <TableCell align="center">{agent.total_leads}</TableCell>
                  <TableCell align="center">{agent.won_leads}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: agent.conversion_rate > 20 ? 'success.main' : 'inherit' }}>
                    {agent.conversion_rate}%
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Reports;
