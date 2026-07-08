<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeadSource;

class LeadSourceSeeder extends Seeder
{
    public function run(): void
    {
        $sources = [
            ['name' => 'Website', 'is_active' => true],
            ['name' => 'Facebook', 'is_active' => true],
            ['name' => 'Google Ads', 'is_active' => true],
            ['name' => 'Referral', 'is_active' => true],
            ['name' => 'Cold Call', 'is_active' => true],
            ['name' => 'Email Campaign', 'is_active' => true],
            ['name' => 'Trade Show', 'is_active' => true],
        ];

        foreach ($sources as $source) {
            LeadSource::firstOrCreate(['name' => $source['name']], $source);
        }
    }
}
