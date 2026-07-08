<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Exports\LeadsExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Lead;

class ImportExportController extends Controller
{
    use ApiResponse;

    public function exportCsv()
    {
        return Excel::download(new LeadsExport, 'leads.csv');
    }

    public function exportExcel()
    {
        return Excel::download(new LeadsExport, 'leads.xlsx');
    }

    public function exportPdf()
    {
        $leads = Lead::with(['assignedUser', 'source', 'status'])->get();
        
        // Quick HTML string for the PDF to avoid creating a whole blade view for this example
        $html = '<h1>Leads Report</h1><table border="1" cellpadding="5" cellspacing="0" style="width:100%">';
        $html .= '<tr><th>Contact</th><th>Company</th><th>Status</th><th>Priority</th></tr>';
        
        foreach ($leads as $lead) {
            $status = $lead->status->name ?? 'N/A';
            $html .= "<tr><td>{$lead->contact_name}</td><td>{$lead->company_name}</td><td>{$status}</td><td>{$lead->priority}</td></tr>";
        }
        $html .= '</table>';
        
        $pdf = Pdf::loadHTML($html);
        return $pdf->download('leads.pdf');
    }
    
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls'
        ]);
        
        // This is a placeholder for the actual import logic
        // E.g. Excel::import(new LeadsImport, $request->file('file'));
        
        return $this->successResponse(null, 'Leads imported successfully');
    }
}
