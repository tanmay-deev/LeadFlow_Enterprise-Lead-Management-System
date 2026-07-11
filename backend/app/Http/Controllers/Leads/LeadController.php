<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Requests\Lead\UpdateLeadRequest;
use App\Http\Requests\Lead\UpdateLeadStatusRequest;
use App\Http\Requests\Lead\AssignLeadRequest;
use App\Services\Lead\LeadService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    use ApiResponse;

    protected $leadService;

    public function __construct(LeadService $leadService)
    {
        $this->leadService = $leadService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $leads = $this->leadService->getAllLeads($request->all(), $perPage);
        
        return response()->json([
            'success' => true,
            'message' => 'Leads retrieved successfully',
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'per_page' => $leads->perPage(),
                'total' => $leads->total(),
                'last_page' => $leads->lastPage(),
            ]
        ]);
    }

    public function store(StoreLeadRequest $request)
    {
        $lead = $this->leadService->createLead($request->validated());
        return $this->successResponse($lead, 'Lead created successfully', 201);
    }

    public function show($id)
    {
        $lead = $this->leadService->getLeadById($id);
        return $this->successResponse($lead, 'Lead retrieved successfully');
    }

    public function update(UpdateLeadRequest $request, $id)
    {
        $lead = $this->leadService->updateLead($id, $request->validated());
        return $this->successResponse($lead, 'Lead updated successfully');
    }

    public function destroy($id)
    {
        $this->leadService->deleteLead($id);
        return response()->json([], 204);
    }

    public function updateStatus(UpdateLeadStatusRequest $request, $id)
    {
        $lead = $this->leadService->updateStatus($id, $request->status_id);
        return $this->successResponse($lead, 'Lead status updated successfully');
    }

    public function assign(AssignLeadRequest $request, $id)
    {
        $lead = $this->leadService->assignLead($id, $request->assigned_user_id);
        return $this->successResponse($lead, 'Lead assigned successfully');
    }

    public function timeline($id)
    {
        $timeline = $this->leadService->getTimeline($id);
        return $this->successResponse($timeline, 'Lead timeline retrieved successfully');
    }

    public function export(Request $request)
    {
        $filters = $request->all();
        $leads = $this->leadService->getAllLeads($filters, 1000000); // get practically all
        
        $csvFileName = 'leads_export_' . now()->format('Y_m_d_His') . '.csv';
        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = array('Contact Name', 'Company', 'Email', 'Phone', 'Source', 'Status', 'Assigned To', 'Created At');

        $callback = function() use($leads, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($leads as $lead) {
                $row['Contact Name'] = $lead->contact_name;
                $row['Company'] = $lead->company_name;
                $row['Email'] = $lead->email;
                $row['Phone'] = $lead->phone;
                $row['Source'] = $lead->source->name ?? '';
                $row['Status'] = $lead->status->name ?? '';
                $row['Assigned To'] = $lead->assignedUser ? $lead->assignedUser->first_name . ' ' . $lead->assignedUser->last_name : '';
                $row['Created At'] = $lead->created_at->format('Y-m-d H:i:s');

                fputcsv($file, array($row['Contact Name'], $row['Company'], $row['Email'], $row['Phone'], $row['Source'], $row['Status'], $row['Assigned To'], $row['Created At']));
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt',
            'duplicate_action' => 'nullable|in:ignore,replace'
        ]);

        $file = $request->file('file');
        $duplicateAction = $request->input('duplicate_action');
        
        $handle = fopen($file->path(), 'r');
        
        $header = fgetcsv($handle, 1000, ',');
        $importedCount = 0;
        $replacedCount = 0;

        $sourceId = \App\Models\LeadSource::first()->id ?? 1;
        $statusId = \App\Models\LeadStatus::where('name', 'New')->first()->id ?? 1;

        $rows = [];
        while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
            if (count($data) < 2) continue; // skip empty rows
            $rows[] = $data;
        }
        fclose($handle);

        $newLeads = [];
        $duplicateLeads = [];

        foreach ($rows as $data) {
            $email = trim($data[2] ?? '');
            $phone = trim($data[3] ?? '');

            $existingLead = null;
            if ($email || $phone) {
                $query = \App\Models\Lead::query();
                if ($email) {
                    $query->where('email', $email);
                }
                if ($phone) {
                    $query->orWhere('phone', $phone);
                }
                $existingLead = $query->first();
            }

            if ($existingLead) {
                $duplicateLeads[] = [
                    'existing' => $existingLead,
                    'new_data' => $data
                ];
            } else {
                $newLeads[] = $data;
            }
        }

        // If duplicates found and no action specified, prompt user
        if (!$duplicateAction && count($duplicateLeads) > 0) {
            return response()->json([
                'success' => true,
                'requires_confirmation' => true,
                'duplicate_count' => count($duplicateLeads),
                'new_count' => count($newLeads),
                'message' => 'Duplicates found in the import file.'
            ]);
        }

        // Import new leads
        foreach ($newLeads as $data) {
            \App\Models\Lead::create([
                'contact_name' => $data[0] ?? 'Unknown',
                'company_name' => $data[1] ?? null,
                'email' => $data[2] ?? null,
                'phone' => $data[3] ?? null,
                'source_id' => $sourceId,
                'status_id' => $statusId,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id()
            ]);
            $importedCount++;
        }

        // Handle duplicates if replace is chosen
        if ($duplicateAction === 'replace') {
            foreach ($duplicateLeads as $duplicate) {
                $existingLead = $duplicate['existing'];
                $data = $duplicate['new_data'];
                $existingLead->update([
                    'contact_name' => $data[0] ?? $existingLead->contact_name,
                    'company_name' => $data[1] ?? $existingLead->company_name,
                    'email' => $data[2] ?? $existingLead->email,
                    'phone' => $data[3] ?? $existingLead->phone,
                    'updated_by' => auth()->id()
                ]);
                $replacedCount++;
            }
        }

        $msg = "$importedCount new leads imported successfully.";
        if ($replacedCount > 0) {
            $msg .= " $replacedCount leads updated.";
        } else if ($duplicateAction === 'ignore' && count($duplicateLeads) > 0) {
            $msg .= " " . count($duplicateLeads) . " duplicates ignored.";
        }

        return $this->successResponse([
            'imported_count' => $importedCount,
            'replaced_count' => $replacedCount,
            'ignored_count' => $duplicateAction === 'ignore' ? count($duplicateLeads) : 0
        ], $msg);
    }
}
