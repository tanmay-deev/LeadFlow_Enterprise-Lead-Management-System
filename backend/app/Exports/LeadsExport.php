<?php

namespace App\Exports;

use App\Models\Lead;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class LeadsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Lead::with(['assignedUser', 'source', 'status'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Contact Name',
            'Company Name',
            'Email',
            'Phone',
            'Priority',
            'Status',
            'Source',
            'Assigned To',
            'Created At',
        ];
    }

    public function map($lead): array
    {
        return [
            $lead->id,
            $lead->contact_name,
            $lead->company_name,
            $lead->email,
            $lead->phone,
            $lead->priority,
            $lead->status->name ?? 'N/A',
            $lead->source->name ?? 'N/A',
            $lead->assignedUser ? $lead->assignedUser->first_name . ' ' . $lead->assignedUser->last_name : 'Unassigned',
            $lead->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
