<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\Document\StoreLeadDocumentRequest;
use App\Services\Document\LeadDocumentService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Storage;

class LeadDocumentController extends Controller
{
    use ApiResponse;

    protected $documentService;

    public function __construct(LeadDocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    public function index($leadId)
    {
        $documents = $this->documentService->getDocumentsForLead($leadId);
        return $this->successResponse($documents, 'Documents retrieved successfully');
    }

    public function store(StoreLeadDocumentRequest $request, $leadId)
    {
        $document = $this->documentService->upload($leadId, $request->file('file'));
        return $this->successResponse($document, 'Document uploaded successfully', 201);
    }

    public function destroy($id)
    {
        $this->documentService->delete($id);
        return response()->json([], 204);
    }

    public function download($id)
    {
        $path = $this->documentService->getFilePath($id);
        
        if (!file_exists($path)) {
            return $this->errorResponse('File not found', [], 404);
        }

        return response()->download($path);
    }
}
