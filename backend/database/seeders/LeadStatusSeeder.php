<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeadStatus;

class LeadStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['name' => 'New', 'display_order' => 1, 'color' => '#3b82f6', 'is_closed' => false],
            ['name' => 'Attempted Contact', 'display_order' => 2, 'color' => '#f59e0b', 'is_closed' => false],
            ['name' => 'Contacted', 'display_order' => 3, 'color' => '#10b981', 'is_closed' => false],
            ['name' => 'Interested', 'display_order' => 4, 'color' => '#8b5cf6', 'is_closed' => false],
            ['name' => 'Qualified', 'display_order' => 5, 'color' => '#059669', 'is_closed' => false],
            ['name' => 'Proposal Sent', 'display_order' => 6, 'color' => '#6366f1', 'is_closed' => false],
            ['name' => 'Negotiation', 'display_order' => 7, 'color' => '#ec4899', 'is_closed' => false],
            ['name' => 'Won', 'display_order' => 8, 'color' => '#16a34a', 'is_closed' => true],
            ['name' => 'Lost', 'display_order' => 9, 'color' => '#ef4444', 'is_closed' => true],
            ['name' => 'Duplicate', 'display_order' => 10, 'color' => '#64748b', 'is_closed' => true],
            ['name' => 'Spam', 'display_order' => 11, 'color' => '#0f172a', 'is_closed' => true],
        ];

        foreach ($statuses as $status) {
            LeadStatus::firstOrCreate(['name' => $status['name']], $status);
        }
    }
}
