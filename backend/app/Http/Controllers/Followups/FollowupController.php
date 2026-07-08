<?php

namespace App\Http\Controllers\Followups;

use App\Http\Controllers\Controller;
use App\Http\Requests\Followup\StoreFollowupRequest;
use App\Http\Requests\Followup\UpdateFollowupRequest;
use App\Services\Followup\FollowupService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class FollowupController extends Controller
{
    use ApiResponse;

    protected $followupService;

    public function __construct(FollowupService $followupService)
    {
        $this->followupService = $followupService;
    }

    public function index()
    {
        $followups = $this->followupService->getAll();
        
        return response()->json([
            'success' => true,
            'message' => 'Follow-ups retrieved successfully',
            'data' => $followups->items(),
            'meta' => [
                'current_page' => $followups->currentPage(),
                'per_page' => $followups->perPage(),
                'total' => $followups->total(),
                'last_page' => $followups->lastPage(),
            ]
        ]);
    }

    public function store(StoreFollowupRequest $request)
    {
        $followup = $this->followupService->create($request->validated());
        return $this->successResponse($followup, 'Follow-up created successfully', 201);
    }

    public function show($id)
    {
        $followup = $this->followupService->getById($id);
        return $this->successResponse($followup, 'Follow-up retrieved successfully');
    }

    public function update(UpdateFollowupRequest $request, $id)
    {
        $followup = $this->followupService->update($id, $request->validated());
        return $this->successResponse($followup, 'Follow-up updated successfully');
    }

    public function destroy($id)
    {
        $this->followupService->delete($id);
        return response()->json([], 204);
    }

    public function complete(Request $request, $id)
    {
        $outcome = $request->input('outcome');
        $followup = $this->followupService->complete($id, $outcome);
        return $this->successResponse($followup, 'Follow-up marked as completed');
    }
}
