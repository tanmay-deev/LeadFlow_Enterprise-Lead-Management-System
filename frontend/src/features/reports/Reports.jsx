import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Avatar,
  TablePagination,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchConversionReport, fetchAgentPerformance } from '../../api/reportApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { format, subDays } from 'date-fns';

// Icons
import DownloadIcon from '@mui/icons-material/Download';
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

// Components
import DashboardKpiCard from '../dashboard/components/DashboardKpiCard';
import { LeadsBySourceBarChart, WonLostDoughnutChart, SourceConversionChart, LeadsTrendChart } from './components/ReportCharts';
import AgentPerformanceChart from './components/AgentPerformanceChart';

const Reports = () => {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Pagination for Agent Table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const handleExportClick = (event) => setExportAnchorEl(event.currentTarget);
  const handleExportClose = () => setExportAnchorEl(null);

  const handleExportCSV = () => {
    handleExportClose();
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const token = localStorage.getItem('token');
    
    fetch(`http://localhost:8000/api/v1/reports/export-csv?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Company_Report_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV exported successfully');
    })
    .catch(err => {
      console.error(err);
      toast.error('Failed to export CSV');
    });
  };

  const handleExportPDF = async () => {
    handleExportClose();
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Page 1: Header
      pdf.setFontSize(22);
      pdf.setTextColor(40, 40, 40);
      pdf.text('LeadFlow Performance Report', 14, 20);
      
      pdf.setFontSize(11);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Date Range: ${startDate || 'All Time'} to ${endDate || 'All Time'}`, 14, 28);
      
      // Executive Summary Table
      autoTable(pdf, {
        startY: 35,
        head: [['Total Leads', 'Won Leads', 'Lost Leads', 'Conversion Rate']],
        body: [[report.total_leads, report.won_leads, report.lost_leads, `${report.conversion_rate}%`]],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], halign: 'center' },
        styles: { fontSize: 12, halign: 'center', cellPadding: 6 }
      });
      
      let currentY = pdf.lastAutoTable.finalY + 15;
      
      // Chart Extraction Helper
      const addChart = async (id, x, y, w, h) => {
        const el = document.getElementById(id);
        if (el) {
          const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#161b22' });
          pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, w, h);
        }
      };

      // Page 1 Charts
      await addChart('trend-chart', 14, currentY, 182, 80);
      currentY += 85;
      
      await addChart('won-lost-chart', 14, currentY, 90, 80);
      await addChart('source-bar-chart', 106, currentY, 90, 80);
      
      // Page 2: Agent Performance
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 40);
      pdf.text('Agent Performance Breakdown', 14, 20);
      
      const agentTableData = agentList.map(a => [
        a.name, 
        a.total_leads, 
        a.won_leads, 
        `${a.conversion_rate}%`
      ]);
      
      autoTable(pdf, {
        startY: 28,
        head: [['Agent Name', 'Total Leads', 'Won Leads', 'Conversion Rate']],
        body: agentTableData,
        theme: 'striped',
        headStyles: { fillColor: [31, 41, 55] },
        styles: { fontSize: 10, cellPadding: 5 }
      });
      
      pdf.save(`LeadFlow_Report_${new Date().getTime()}.pdf`);
      toast.success('Professional PDF generated successfully');
    } catch (error) {
      console.error('PDF error', error);
      toast.error('Failed to generate PDF');
    }
  };

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
    by_source: [],
    leads_over_time: []
  };

  const agentList = Array.isArray(agentData?.data) ? agentData.data : [];
  
  const handleFilter = () => {
    setFetchTrigger(prev => prev + 1);
    setPage(0); // Reset pagination on filter
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFetchTrigger(prev => prev + 1);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedAgents = agentList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getConversionBadge = (rate) => {
    const numRate = Number(rate);
    if (numRate >= 20) return { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
    if (numRate >= 10) return { bg: 'rgba(249, 115, 22, 0.1)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' };
    return { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
  };

  return (
    <Box id="report-container" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: '#8b949e' }}>
            Comprehensive overview of your sales performance and agent metrics.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Custom Dark Date Filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#161b22', p: 0.5, borderRadius: '8px', border: '1px solid #30363d' }}>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#c9d1d9', outline: 'none', padding: '4px 8px', colorScheme: 'dark' }}
              title="Start Date"
            />
            <Typography sx={{ color: '#8b949e' }}>to</Typography>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#c9d1d9', outline: 'none', padding: '4px 8px', colorScheme: 'dark' }}
              title="End Date"
            />
            <Button 
              variant="text" 
              onClick={handleFilter}
              sx={{ color: '#3b82f6', minWidth: 'auto', px: 2, fontWeight: 600 }}
            >
              Filter
            </Button>
            {(startDate || endDate) && (
              <Button 
                variant="text" 
                onClick={handleClearFilter}
                sx={{ color: '#8b949e', minWidth: 'auto', px: 1, fontWeight: 600, '&:hover': { color: '#ef4444' } }}
              >
                Clear
              </Button>
            )}
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            sx={{ 
              bgcolor: '#238636', 
              color: '#fff',
              '&:hover': { bgcolor: '#2ea043' },
              boxShadow: '0 0 10px rgba(35, 134, 54, 0.3)',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Export Report
          </Button>

          {/* Export Dropdown Menu */}
          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportClose}
            PaperProps={{
              sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', minWidth: 160, mt: 0.5 }
            }}
          >
            <MenuItem onClick={handleExportPDF} sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' } }}>
              <ListItemIcon><PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 20 }} /></ListItemIcon>
              <ListItemText>Export as PDF</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleExportCSV} sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' } }}>
              <ListItemIcon><TableChartIcon sx={{ color: '#22c55e', fontSize: 20 }} /></ListItemIcon>
              <ListItemText>Export as CSV</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* KPI ROW */}
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 1 }}>
        <DashboardKpiCard 
          title="Total Leads" 
          value={report.total_leads} 
          icon={<GroupsIcon />} 
          color="blue" 
          loading={isLoading} 
        />
        <DashboardKpiCard 
          title="Won Leads" 
          value={report.won_leads} 
          icon={<HandshakeIcon />} 
          color="green" 
          loading={isLoading} 
        />
        <DashboardKpiCard 
          title="Lost Leads" 
          value={report.lost_leads} 
          icon={<CancelIcon />} 
          color="red" 
          loading={isLoading} 
        />
        <DashboardKpiCard 
          title="Conversion Rate" 
          value={`${report.conversion_rate}%`} 
          icon={<TrendingUpIcon />} 
          color="purple" 
          loading={isLoading} 
        />
      </Box>

      {/* CHARTS ROW 1: Trend & Won/Lost */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box id="trend-chart" sx={{ flex: 2, minWidth: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <LeadsTrendChart data={report.leads_over_time} />
        </Box>
        <Box id="won-lost-chart" sx={{ flex: 1, minWidth: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <WonLostDoughnutChart won={report.won_leads} lost={report.lost_leads} />
        </Box>
      </Box>

      {/* CHARTS ROW 2: Source Breakdown */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        <Box id="source-bar-chart" sx={{ flex: 1, minWidth: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <LeadsBySourceBarChart data={report.by_source} />
        </Box>
        <Box id="source-conversion-chart" sx={{ flex: 1, minWidth: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <SourceConversionChart data={report.by_source} />
        </Box>
      </Box>

      {/* CHARTS ROW 3: Agent Performance */}
      <Box sx={{ width: '100%' }}>
        <AgentPerformanceChart data={agentList.slice(0, 5)} />
      </Box>

      {/* AGENT PERFORMANCE TABLE */}
      <Box>
        <Typography variant="h6" sx={{ color: '#e6edf3', fontWeight: 600, mb: 2 }}>Agent Performance Breakdown</Typography>
        <TableContainer component={Paper} sx={{ bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', backgroundImage: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #30363d', color: '#8b949e', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                <TableCell>Agent Name</TableCell>
                <TableCell align="center">Total Leads</TableCell>
                <TableCell align="center">Won Leads</TableCell>
                <TableCell align="right">Conversion Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isAgentLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : agentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                    <Typography variant="body2" sx={{ color: '#8b949e' }}>
                      No data available for this period.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAgents.map((agent) => {
                  const badge = getConversionBadge(agent.conversion_rate);
                  return (
                    <TableRow key={agent.id} sx={{ '& td': { borderBottom: '1px solid #30363d', color: '#c9d1d9' }, '&:last-child td': { borderBottom: 'none' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1f2937', color: '#9ca3af', fontSize: '0.875rem', border: '1px solid #374151' }}>
                            {getInitials(agent.name)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{agent.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{agent.total_leads}</TableCell>
                      <TableCell align="center">{agent.won_leads}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ 
                          display: 'inline-block', 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: badge.bg, 
                          color: badge.color, 
                          border: `1px solid ${badge.border}`,
                          borderRadius: '12px', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {agent.conversion_rate}%
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={agentList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              color: '#8b949e',
              borderTop: '1px solid #30363d',
              '.MuiTablePagination-selectIcon': { color: '#8b949e' },
              '.MuiTablePagination-actions button': { color: '#c9d1d9' },
              '.Mui-disabled': { color: '#484f58 !important' }
            }}
          />
        </TableContainer>
      </Box>

    </Box>
  );
};

export default Reports;
