<?php

namespace App\Services\Dashboard;

use App\Models\Lead;
use App\Models\LeadStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getSummary()
    {
        $today = Carbon::today();
        
        $totalLeads = Lead::count();
        $todaysLeads = Lead::whereDate('created_at', $today)->count();
        
        $statuses = LeadStatus::all()->keyBy('name');
        
        $newLeads = Lead::where('status_id', $statuses['New']->id ?? null)->count();
        $contactedLeads = Lead::where('status_id', $statuses['Contacted']->id ?? null)->count();
        $qualifiedLeads = Lead::where('status_id', $statuses['Qualified']->id ?? null)->count();
        $wonLeads = Lead::where('status_id', $statuses['Won']->id ?? null)->count();
        $lostLeads = Lead::where('status_id', $statuses['Lost']->id ?? null)->count();
        
        // Follow-ups scheduled for today or pending
        $followupsPending = \App\Models\Followup::where('status', 'pending')->count();

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

    public function getCharts()
    {
        // 1. Lead Source Chart
        $leadSources = DB::table('leads')
            ->join('lead_sources', 'leads.source_id', '=', 'lead_sources.id')
            ->select('lead_sources.name', DB::raw('count(*) as count'))
            ->groupBy('lead_sources.name')
            ->get();

        // 2. Monthly Leads Chart (Last 12 months)
        $monthlyLeads = Lead::select(
                DB::raw('count(id) as `count`'),
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') new_date"),
                DB::raw('YEAR(created_at) year, MONTH(created_at) month')
            )
            ->groupBy('year', 'month', 'new_date')
            ->orderBy('new_date', 'asc')
            ->limit(12)
            ->get();

        // 3. Conversion Ratio
        $total = Lead::count();
        $wonStatusId = LeadStatus::where('name', 'Won')->value('id');
        $won = Lead::where('status_id', $wonStatusId)->count();
        $conversionRatio = $total > 0 ? round(($won / $total) * 100, 2) : 0;

        // 4. Sales Performance (Leads Won by User)
        $salesPerformance = DB::table('leads')
            ->join('users', 'leads.assigned_user_id', '=', 'users.id')
            ->where('leads.status_id', $wonStatusId)
            ->select(DB::raw("CONCAT(users.first_name, ' ', users.last_name) as sales_rep"), DB::raw('count(*) as won_count'))
            ->groupBy('sales_rep')
            ->orderByDesc('won_count')
            ->get();

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
