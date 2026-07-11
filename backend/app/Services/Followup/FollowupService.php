<?php

namespace App\Services\Followup;

use App\Models\Followup;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use App\Services\Notification\NotificationService;

class FollowupService
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
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

        $followup->load('lead');
        if (isset($data['assigned_user_id'])) {
            $this->notificationService->send(
                $data['assigned_user_id'],
                'New Follow-up Task',
                "You have a new follow-up scheduled for {$followup->lead->contact_name}",
                'followup'
            );
        }

        return $followup->load(['assignedUser']);
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

        $followup->load('lead');
        if (isset($data['assigned_user_id']) && $data['assigned_user_id'] != $oldData['assigned_user_id']) {
            $this->notificationService->send(
                $data['assigned_user_id'],
                'Follow-up Task Re-assigned',
                "You have been assigned to a follow-up for {$followup->lead->contact_name}",
                'followup'
            );
        }

        return $followup->load(['assignedUser']);
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
