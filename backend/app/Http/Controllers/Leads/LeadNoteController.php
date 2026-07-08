<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\Note\StoreLeadNoteRequest;
use App\Http\Requests\Note\UpdateLeadNoteRequest;
use App\Services\Note\LeadNoteService;
use App\Traits\ApiResponse;

class LeadNoteController extends Controller
{
    use ApiResponse;

    protected $noteService;

    public function __construct(LeadNoteService $noteService)
    {
        $this->noteService = $noteService;
    }

    public function index($leadId)
    {
        $notes = $this->noteService->getNotesForLead($leadId);
        return $this->successResponse($notes, 'Notes retrieved successfully');
    }

    public function store(StoreLeadNoteRequest $request, $leadId)
    {
        $note = $this->noteService->create($leadId, $request->validated());
        return $this->successResponse($note, 'Note added successfully', 201);
    }

    public function update(UpdateLeadNoteRequest $request, $id)
    {
        $note = $this->noteService->update($id, $request->validated());
        return $this->successResponse($note, 'Note updated successfully');
    }

    public function destroy($id)
    {
        $this->noteService->delete($id);
        return response()->json([], 204);
    }
}
