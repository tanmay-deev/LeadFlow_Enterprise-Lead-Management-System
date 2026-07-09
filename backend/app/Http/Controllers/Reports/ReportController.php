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

        $total = (clone $query)->count();
        $wonStatusId = \App\Models\LeadStatus::where('name', 'Won')->value('id');
        $won = (clone $query)->where('status_id', $wonStatusId)->count();
        $lostStatusId = \App\Models\LeadStatus::where('name', 'Lost')->value('id');
        $lost = (clone $query)->where('status_id', $lostStatusId)->count();
        
        return $this->successResponse([
            'total_leads' => $total,
            'won_leads' => $won,
            'lost_leads' => $lost,
            'conversion_rate' => $total > 0 ? round(($won / $total) * 100, 2) : 0
        ], 'Conversion report retrieved');
    }

    public function agentPerformance(\Illuminate\Http\Request $request)
    {
        $query = \App\Models\User::has('leads');
        
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
}
