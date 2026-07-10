<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use App\Traits\ApiResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function summary()
    {
        $dateRange = request('date_range', 'all_time');
        $summary = $this->dashboardService->getSummary($dateRange);
        return $this->successResponse($summary, 'Dashboard summary retrieved successfully');
    }

    public function charts()
    {
        $dateRange = request('date_range', 'all_time');
        $charts = $this->dashboardService->getCharts($dateRange);
        return $this->successResponse($charts, 'Dashboard charts retrieved successfully');
    }

    public function recentActivities()
    {
        $activities = $this->dashboardService->getRecentActivities();
        return $this->successResponse($activities, 'Recent activities retrieved successfully');
    }

    public function upcomingFollowups()
    {
        $followups = $this->dashboardService->getUpcomingFollowups();
        return $this->successResponse($followups, 'Upcoming follow-ups retrieved successfully');
    }
}
