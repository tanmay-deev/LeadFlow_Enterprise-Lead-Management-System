<?php

namespace App\Services\Note;

use App\Models\LeadNote;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LeadNoteService
{
    public function getNotesForLead($leadId)
    {
        return LeadNote::where('lead_id', $leadId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create($leadId, array $data)
    {
        $data['lead_id'] = $leadId;
        $data['user_id'] = Auth::id();
        
        $note = LeadNote::create($data);

        $this->logActivity($leadId, 'note_added', null, $note->toArray());

        return $note->load('user');
    }

    public function update($id, array $data)
    {
        $note = LeadNote::findOrFail($id);
        $oldData = $note->toArray();
        
        $note->update($data);

        $this->logActivity($note->lead_id, 'note_updated', $oldData, $note->toArray());

        return $note->load('user');
    }

    public function delete($id)
    {
        $note = LeadNote::findOrFail($id);
        $oldData = $note->toArray();
        $leadId = $note->lead_id;
        
        $note->delete();

        $this->logActivity($leadId, 'note_deleted', $oldData, null);
        return true;
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
