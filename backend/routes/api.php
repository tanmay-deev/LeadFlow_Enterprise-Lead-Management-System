<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\SearchController;

Route::prefix('v1')->group(function () {
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

    Route::middleware('auth:api')->group(function () {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/profile', [AuthController::class, 'profile']);
        Route::put('auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('auth/password', [AuthController::class, 'updatePassword']);
        
        // Global Search
        Route::get('search', [SearchController::class, 'index']);
        
        // Lead Management
        Route::get('leads/export', [\App\Http\Controllers\Leads\LeadController::class, 'export']);
        Route::post('leads/import', [\App\Http\Controllers\Leads\LeadController::class, 'import']);
        Route::get('leads', [\App\Http\Controllers\Leads\LeadController::class, 'index']);
        Route::post('leads', [\App\Http\Controllers\Leads\LeadController::class, 'store']);
        Route::get('leads/{id}', [\App\Http\Controllers\Leads\LeadController::class, 'show']);
        Route::put('leads/{id}', [\App\Http\Controllers\Leads\LeadController::class, 'update']);
        Route::delete('leads/{id}', [\App\Http\Controllers\Leads\LeadController::class, 'destroy']);
        Route::patch('leads/{id}/status', [\App\Http\Controllers\Leads\LeadController::class, 'updateStatus']);
        Route::patch('leads/{id}/assign', [\App\Http\Controllers\Leads\LeadController::class, 'assign']);
        Route::get('leads/{id}/timeline', [\App\Http\Controllers\Leads\LeadController::class, 'timeline']);
        // Follow-ups
        Route::get('followups', [\App\Http\Controllers\Followups\FollowupController::class, 'index']);
        Route::post('followups', [\App\Http\Controllers\Followups\FollowupController::class, 'store']);
        Route::get('followups/{id}', [\App\Http\Controllers\Followups\FollowupController::class, 'show']);
        Route::put('followups/{id}', [\App\Http\Controllers\Followups\FollowupController::class, 'update']);
        Route::delete('followups/{id}', [\App\Http\Controllers\Followups\FollowupController::class, 'destroy']);
        Route::patch('followups/{id}/complete', [\App\Http\Controllers\Followups\FollowupController::class, 'complete']);

        // Lead Notes
        Route::get('leads/{id}/notes', [\App\Http\Controllers\Leads\LeadNoteController::class, 'index']);
        Route::post('leads/{id}/notes', [\App\Http\Controllers\Leads\LeadNoteController::class, 'store']);
        Route::put('notes/{id}', [\App\Http\Controllers\Leads\LeadNoteController::class, 'update']);
        Route::delete('notes/{id}', [\App\Http\Controllers\Leads\LeadNoteController::class, 'destroy']);

        // Dashboard
        Route::get('dashboard/summary', [\App\Http\Controllers\Dashboard\DashboardController::class, 'summary']);
        Route::get('dashboard/charts', [\App\Http\Controllers\Dashboard\DashboardController::class, 'charts']);
        Route::get('dashboard/recent-activities', [\App\Http\Controllers\Dashboard\DashboardController::class, 'recentActivities']);
        Route::get('dashboard/upcoming-followups', [\App\Http\Controllers\Dashboard\DashboardController::class, 'upcomingFollowups']);

        // Lead Documents
        Route::get('leads/{id}/documents', [\App\Http\Controllers\Leads\LeadDocumentController::class, 'index']);
        Route::post('leads/{id}/documents', [\App\Http\Controllers\Leads\LeadDocumentController::class, 'store']);
        Route::delete('documents/{id}', [\App\Http\Controllers\Leads\LeadDocumentController::class, 'destroy']);
        Route::get('documents/{id}/download', [\App\Http\Controllers\Leads\LeadDocumentController::class, 'download']);
        // Import/Export
        Route::post('import/leads', [\App\Http\Controllers\Leads\ImportExportController::class, 'import']);
        Route::get('export/leads/csv', [\App\Http\Controllers\Leads\ImportExportController::class, 'exportCsv']);
        Route::get('export/leads/excel', [\App\Http\Controllers\Leads\ImportExportController::class, 'exportExcel']);
        Route::get('export/leads/pdf', [\App\Http\Controllers\Leads\ImportExportController::class, 'exportPdf']);

        // Users
        Route::get('users', [\App\Http\Controllers\Users\UserController::class, 'index']);
        Route::post('users', [\App\Http\Controllers\Users\UserController::class, 'store']);
        Route::get('users/{id}', [\App\Http\Controllers\Users\UserController::class, 'show']);
        Route::put('users/{id}', [\App\Http\Controllers\Users\UserController::class, 'update']);
        Route::delete('users/{id}', [\App\Http\Controllers\Users\UserController::class, 'destroy']);

        // Roles & Permissions
        Route::get('roles', [\App\Http\Controllers\Auth\RolePermissionController::class, 'roles']);
        Route::get('permissions', [\App\Http\Controllers\Auth\RolePermissionController::class, 'permissions']);

        // Notifications
        Route::get('notifications', [\App\Http\Controllers\Notifications\NotificationController::class, 'index']);
        Route::patch('notifications/{id}/read', [\App\Http\Controllers\Notifications\NotificationController::class, 'markAsRead']);
        Route::patch('notifications/read-all', [\App\Http\Controllers\Notifications\NotificationController::class, 'markAllAsRead']);

        // Reports
        Route::get('reports/daily', [\App\Http\Controllers\Reports\ReportController::class, 'daily']);
        Route::get('reports/conversion', [\App\Http\Controllers\Reports\ReportController::class, 'conversion']);
        Route::get('reports/agent-performance', [\App\Http\Controllers\Reports\ReportController::class, 'agentPerformance']);
    });
});
