<?php

namespace App\Services\Document;

use App\Models\LeadDocument;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class LeadDocumentService
{
    public function getDocumentsForLead($leadId)
    {
        return LeadDocument::where('lead_id', $leadId)
            ->with('uploader')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function upload($leadId, $file)
    {
        $path = $file->store('lead_documents', 'local');

        $document = LeadDocument::create([
            'lead_id' => $leadId,
            'uploaded_by' => Auth::id(),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
        ]);

        $this->logActivity($leadId, 'document_uploaded', null, $document->toArray());

        return $document->load('uploader');
    }

    public function delete($id)
    {
        $document = LeadDocument::findOrFail($id);
        $oldData = $document->toArray();
        $leadId = $document->lead_id;
        
        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();

        $this->logActivity($leadId, 'document_deleted', $oldData, null);
        return true;
    }

    public function getFilePath($id)
    {
        $document = LeadDocument::findOrFail($id);
        return storage_path('app/private/' . $document->file_path);
    }

    protected function logActivity($leadId, $action, $oldValue = null, $newValue = null)
    {
        ActivityLog::create([
            'lead_id' => $leadId,
            'user_id' => Auth::id(),
            'action' => $action,
            'old_value' => $oldValue,
            'new_value' => $newValue,
        ]);
    }
}
