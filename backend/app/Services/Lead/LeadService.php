<?php

namespace App\Services\Lead;

use App\Models\Lead;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LeadService
{
    public function getAllLeads($filters = [], $perPage = 15)
    {
        $query = Lead::with(['assignedUser', 'source', 'status']);

        // Filtering
        if (isset($filters['status_id']) && $filters['status_id'] !== '') {
            $query->where('status_id', $filters['status_id']);
        } elseif (isset($filters['status'])) {
            $query->whereHas('status', function($q) use ($filters) {
                $q->where('name', $filters['status']);
            });
        }
        
        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        
        if (isset($filters['source_id']) && $filters['source_id'] !== '') {
            $query->where('source_id', $filters['source_id']);
        } elseif (isset($filters['source'])) {
            $query->whereHas('source', function($q) use ($filters) {
                $q->where('name', $filters['source']);
            });
        }
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('contact_name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        if (isset($filters['sort'])) {
            $order = $filters['order'] ?? 'asc';
            $query->orderBy($filters['sort'], $order);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    public function createLead(array $data)
    {
        $data['created_by'] = Auth::id();
        $data['updated_by'] = Auth::id();
        
        // If status is not provided, default to 'New'
        if (!isset($data['status_id'])) {
            $defaultStatus = \App\Models\LeadStatus::where('name', 'New')->first();
            $data['status_id'] = $defaultStatus ? $defaultStatus->id : null;
        }

        $lead = Lead::create($data);

        $this->logActivity($lead->id, 'created', null, $lead->toArray());

        return $lead->load(['assignedUser', 'source', 'status']);
    }

    public function getLeadById($id)
    {
        return Lead::with(['assignedUser', 'source', 'status', 'followups', 'notes', 'documents'])->findOrFail($id);
    }

    public function updateLead($id, array $data)
    {
        $lead = Lead::findOrFail($id);
        $oldData = $lead->toArray();

        $data['updated_by'] = Auth::id();
        $lead->update($data);

        $this->logActivity($lead->id, 'updated', $oldData, $lead->toArray());

        return $lead->load(['assignedUser', 'source', 'status']);
    }

    public function deleteLead($id)
    {
        $lead = Lead::findOrFail($id);
        $oldData = $lead->toArray();
        $lead->delete();

        $this->logActivity($lead->id, 'deleted', $oldData, null);

        return true;
    }

    public function updateStatus($id, $statusId)
    {
        $lead = Lead::findOrFail($id);
        $oldData = $lead->toArray();
        
        $lead->update([
            'status_id' => $statusId,
            'updated_by' => Auth::id()
        ]);

        $this->logActivity($lead->id, 'status_updated', $oldData, $lead->toArray());

        return $lead->load(['assignedUser', 'source', 'status']);
    }

    public function assignLead($id, $userId)
    {
        $lead = Lead::findOrFail($id);
        $oldData = $lead->toArray();
        
        $lead->update([
            'assigned_user_id' => $userId,
            'updated_by' => Auth::id()
        ]);

        $this->logActivity($lead->id, 'assigned', $oldData, $lead->toArray());

        return $lead->load(['assignedUser', 'source', 'status']);
    }

    public function getTimeline($id)
    {
        return ActivityLog::where('lead_id', $id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
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
