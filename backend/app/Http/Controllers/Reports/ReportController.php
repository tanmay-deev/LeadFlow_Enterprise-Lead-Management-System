<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    public function daily()
    {
        $data = Lead::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();
            
        return $this->successResponse($data, 'Daily report retrieved');
    }

    public function conversion(\Illuminate\Http\Request $request)
    {
        $query = Lead::query();
        
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $total = clone $query;
        $totalCount = $total->count();
        $wonStatusId = \App\Models\LeadStatus::where('name', 'Won')->value('id');
        $wonCount = (clone $query)->where('status_id', $wonStatusId)->count();
        $lostStatusId = \App\Models\LeadStatus::where('name', 'Lost')->value('id');
        $lostCount = (clone $query)->where('status_id', $lostStatusId)->count();

        // 1. By Source Breakdown
        $sources = \App\Models\LeadSource::all();
        $bySource = $sources->map(function($source) use ($query, $wonStatusId, $lostStatusId) {
            $sourceQuery = (clone $query)->where('source_id', $source->id);
            $totalS = (clone $sourceQuery)->count();
            $wonS = (clone $sourceQuery)->where('status_id', $wonStatusId)->count();
            $lostS = (clone $sourceQuery)->where('status_id', $lostStatusId)->count();
            
            return [
                'name' => $source->name,
                'total' => $totalS,
                'won' => $wonS,
                'lost' => $lostS,
                'conversion_rate' => $totalS > 0 ? round(($wonS / $totalS) * 100, 2) : 0
            ];
        })->filter(function($s) { return $s['total'] > 0; })->values()->all();

        // 2. Leads Over Time (Trend)
        $leadsOverTime = (clone $query)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();
        
        return $this->successResponse([
            'total_leads' => $totalCount,
            'won_leads' => $wonCount,
            'lost_leads' => $lostCount,
            'conversion_rate' => $totalCount > 0 ? round(($wonCount / $totalCount) * 100, 2) : 0,
            'by_source' => $bySource,
            'leads_over_time' => $leadsOverTime
        ], 'Conversion report retrieved');
    }

    public function agentPerformance(\Illuminate\Http\Request $request)
    {
        $query = \App\Models\User::query(); // Fetch all users to show them in the report even if they have 0 leads
        
        $users = $query->with(['leads' => function($q) use ($request) {
            if ($request->start_date) {
                $q->whereDate('created_at', '>=', $request->start_date);
            }
            if ($request->end_date) {
                $q->whereDate('created_at', '<=', $request->end_date);
            }
        }])->get();

        $wonStatusId = \App\Models\LeadStatus::where('name', 'Won')->value('id');
        
        $data = $users->map(function($user) use ($wonStatusId) {
            $total = $user->leads->count();
            $won = $user->leads->where('status_id', $wonStatusId)->count();
            
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'total_leads' => $total,
                'won_leads' => $won,
                'conversion_rate' => $total > 0 ? round(($won / $total) * 100, 2) : 0
            ];
        });

        // Sort by conversion rate descending
        $data = $data->sortByDesc('conversion_rate')->values()->all();

        return $this->successResponse($data, 'Agent performance retrieved');
    }

    public function exportCsv(\Illuminate\Http\Request $request)
    {
        $query = Lead::query();
        
        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $leads = $query->with(['assignedUser', 'source', 'status'])->orderBy('created_at', 'desc')->get();

        $totalLeads = $leads->count();
        $wonStatusId = \App\Models\LeadStatus::where('name', 'Won')->value('id');
        $lostStatusId = \App\Models\LeadStatus::where('name', 'Lost')->value('id');
        $wonLeads = $leads->where('status_id', $wonStatusId)->count();
        $lostLeads = $leads->where('status_id', $lostStatusId)->count();
        $conversionRate = $totalLeads > 0 ? round(($wonLeads / $totalLeads) * 100, 2) : 0;

        $csvFileName = 'Company_Report_' . now()->format('Y_m_d_His') . '.csv';
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($leads, $totalLeads, $wonLeads, $lostLeads, $conversionRate, $wonStatusId) {
            $file = fopen('php://output', 'w');
            
            // Section 1: Executive Summary
            fputcsv($file, ['EXECUTIVE SUMMARY']);
            fputcsv($file, ['Total Leads', 'Won Leads', 'Lost Leads', 'Conversion Rate (%)']);
            fputcsv($file, [$totalLeads, $wonLeads, $lostLeads, $conversionRate]);
            fputcsv($file, []);
            
            // Section 2: Agent Performance
            fputcsv($file, ['AGENT PERFORMANCE']);
            fputcsv($file, ['Agent Name', 'Total Leads', 'Won Leads', 'Conversion Rate (%)']);
            $agents = $leads->groupBy('assigned_user_id');
            foreach($agents as $agentId => $agentLeads) {
                if(!$agentId) continue;
                $agentUser = $agentLeads->first()->assignedUser;
                $agentName = $agentUser ? $agentUser->first_name . ' ' . $agentUser->last_name : 'Unknown';
                $aTotal = $agentLeads->count();
                $aWon = $agentLeads->where('status_id', $wonStatusId)->count();
                $aRate = $aTotal > 0 ? round(($aWon / $aTotal) * 100, 2) : 0;
                fputcsv($file, [$agentName, $aTotal, $aWon, $aRate]);
            }
            fputcsv($file, []);

            // Section 3: Detailed Leads
            fputcsv($file, ['DETAILED LEADS DATA']);
            fputcsv($file, ['Contact Name', 'Company', 'Email', 'Phone', 'Source', 'Status', 'Assigned To', 'Created At']);
            
            foreach ($leads as $lead) {
                $row['Contact Name'] = $lead->contact_name;
                $row['Company'] = $lead->company_name;
                $row['Email'] = $lead->email;
                $row['Phone'] = $lead->phone;
                $row['Source'] = $lead->source->name ?? '';
                $row['Status'] = $lead->status->name ?? '';
                $row['Assigned To'] = $lead->assignedUser ? $lead->assignedUser->first_name . ' ' . $lead->assignedUser->last_name : '';
                $row['Created At'] = $lead->created_at->format('Y-m-d H:i:s');
                fputcsv($file, array($row['Contact Name'], $row['Company'], $row['Email'], $row['Phone'], $row['Source'], $row['Status'], $row['Assigned To'], $row['Created At']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
