<?php

namespace App\Services\Dashboard;

use App\Models\Lead;
use App\Models\LeadStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private function applyDateRange($query, $dateRange, $column = 'created_at', $isJoin = false)
    {
        $prefix = $isJoin ? 'leads.' : '';
        if ($dateRange === 'today') {
            return $query->whereDate($prefix . $column, Carbon::today());
        } elseif ($dateRange === 'this_week') {
            return $query->whereBetween($prefix . $column, [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($dateRange === 'this_month') {
            return $query->whereBetween($prefix . $column, [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]);
        } elseif ($dateRange === 'this_year') {
            return $query->whereBetween($prefix . $column, [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()]);
        }
        return $query;
    }

    public function getSummary($dateRange = 'all_time')
    {
        $today = Carbon::today();
        
        $totalLeads = $this->applyDateRange(Lead::query(), $dateRange)->count();
        $todaysLeads = Lead::whereDate('created_at', $today)->count(); // Always "Today's Leads"
        
        $statuses = LeadStatus::all()->keyBy('name');
        
        $newLeads = $this->applyDateRange(Lead::where('status_id', $statuses['New']->id ?? null), $dateRange)->count();
        $contactedLeads = $this->applyDateRange(Lead::where('status_id', $statuses['Contacted']->id ?? null), $dateRange)->count();
        $qualifiedLeads = $this->applyDateRange(Lead::where('status_id', $statuses['Qualified']->id ?? null), $dateRange)->count();
        $wonLeads = $this->applyDateRange(Lead::where('status_id', $statuses['Won']->id ?? null), $dateRange)->count();
        $lostLeads = $this->applyDateRange(Lead::where('status_id', $statuses['Lost']->id ?? null), $dateRange)->count();
        
        // Follow-ups scheduled for today or pending
        $followupsPending = \App\Models\Followup::where('status', 'pending')
            ->when($dateRange !== 'all_time', function($q) use ($dateRange) {
                return $this->applyDateRange($q, $dateRange, 'scheduled_at');
            })->count();

        $convertedLeads = $wonLeads; // Assuming won = converted

        return [
            'total_leads' => $totalLeads,
            'todays_leads' => $todaysLeads,
            'new' => $newLeads,
            'contacted' => $contactedLeads,
            'follow_up' => $followupsPending,
            'qualified' => $qualifiedLeads,
            'won' => $wonLeads,
            'lost' => $lostLeads,
            'converted' => $convertedLeads,
        ];
    }

    public function getCharts($dateRange = 'all_time')
    {
        // 1. Lead Source Chart
        $leadSourcesQuery = DB::table('leads')
            ->join('lead_sources', 'leads.source_id', '=', 'lead_sources.id')
            ->select('lead_sources.name', DB::raw('count(*) as count'))
            ->groupBy('lead_sources.name');
        
        $leadSourcesQuery = $this->applyDateRange($leadSourcesQuery, $dateRange, 'created_at', true);
        $leadSources = $leadSourcesQuery->get();

        // 2. Monthly Leads Chart (Last 12 months) - This one might ignore filter or just show months in filter
        // If they filter "today", a monthly chart is weird, but we'll filter it anyway
        $driver = DB::connection()->getDriverName();
        if ($driver === 'pgsql') {
            $monthlyLeadsQuery = Lead::select(
                DB::raw('count(id) as "count"'),
                DB::raw("to_char(created_at, 'YYYY-MM') as new_date")
            );
        } elseif ($driver === 'sqlite') {
            $monthlyLeadsQuery = Lead::select(
                DB::raw('count(id) as count'),
                DB::raw("strftime('%Y-%m', created_at) as new_date")
            );
        } else {
            $monthlyLeadsQuery = Lead::select(
                DB::raw('count(id) as count'),
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as new_date")
            );
        }
        $monthlyLeadsQuery->groupBy('new_date')
            ->orderBy('new_date', 'asc')
            ->limit(12);
        $monthlyLeadsQuery = $this->applyDateRange($monthlyLeadsQuery, $dateRange);
        $monthlyLeads = $monthlyLeadsQuery->get();

        // 3. Conversion Ratio
        $total = $this->applyDateRange(Lead::query(), $dateRange)->count();
        $wonStatusId = LeadStatus::where('name', 'Won')->value('id');
        $won = $this->applyDateRange(Lead::where('status_id', $wonStatusId), $dateRange)->count();
        $conversionRatio = $total > 0 ? round(($won / $total) * 100, 2) : 0;

        // 4. Sales Performance (Leads Won by User)
        $salesPerformanceQuery = DB::table('leads')
            ->join('users', 'leads.assigned_user_id', '=', 'users.id')
            ->where('leads.status_id', $wonStatusId)
            ->select(DB::raw("CONCAT(users.first_name, ' ', users.last_name) as sales_rep"), DB::raw('count(*) as won_count'))
            ->groupBy('sales_rep')
            ->orderByDesc('won_count');
            
        $salesPerformanceQuery = $this->applyDateRange($salesPerformanceQuery, $dateRange, 'created_at', true);
        $salesPerformance = $salesPerformanceQuery->get();

        return [
            'lead_source' => $leadSources,
            'monthly_leads' => $monthlyLeads,
            'conversion_ratio' => $conversionRatio,
            'sales_performance' => $salesPerformance,
        ];
    }

    public function getRecentActivities()
    {
        return \App\Models\ActivityLog::with(['user', 'lead'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
    }

    public function getUpcomingFollowups()
    {
        return \App\Models\Followup::with(['lead', 'assignedUser'])
            ->where('status', 'pending')
            ->whereDate('scheduled_at', '>=', Carbon::today())
            ->orderBy('scheduled_at', 'asc')
            ->limit(10)
            ->get();
    }
}
