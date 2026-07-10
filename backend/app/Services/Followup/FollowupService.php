<?php

namespace App\Services\Followup;

use App\Models\Followup;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class FollowupService
{
    public function getAll(array $filters = [])
    {
        $query = Followup::with(['lead', 'assignedUser']);
        
        if (isset($filters['lead_id'])) {
            $query->where('lead_id', $filters['lead_id']);
        }

        return $query->orderBy('scheduled_at', 'asc')->paginate(15);
    }

    public function create(array $data)
    {
        $followup = Followup::create($data);

        $this->logActivity($followup->lead_id, 'followup_created', null, $followup->toArray());

        return $followup->load(['lead', 'assignedUser']);
    }

    public function getById($id)
    {
        return Followup::with(['lead', 'assignedUser'])->findOrFail($id);
    }

    public function update($id, array $data)
    {
        $followup = Followup::findOrFail($id);
        $oldData = $followup->toArray();
        $followup->update($data);

        $this->logActivity($followup->lead_id, 'followup_updated', $oldData, $followup->toArray());

        return $followup->load(['lead', 'assignedUser']);
    }

    public function complete($id, $outcome = null)
    {
        $followup = Followup::findOrFail($id);
        $oldData = $followup->toArray();
        
        $followup->update([
            'status' => 'completed',
            'completed_at' => now(),
            'outcome' => $outcome,
        ]);

        $this->logActivity($followup->lead_id, 'followup_completed', $oldData, $followup->toArray());

        return $followup->load(['lead', 'assignedUser']);
    }

    public function delete($id)
    {
        $followup = Followup::findOrFail($id);
        $oldData = $followup->toArray();
        $leadId = $followup->lead_id;
        
        $followup->delete();

        $this->logActivity($leadId, 'followup_deleted', $oldData, null);
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
