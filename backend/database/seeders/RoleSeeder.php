<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Super Admin', 'description' => 'System configuration, organization management, user administration'],
            ['name' => 'Admin', 'description' => 'Manage users, reports, leads, and operational settings'],
            ['name' => 'Sales Manager', 'description' => 'Assign leads, monitor teams, evaluate performance'],
            ['name' => 'Sales Executive', 'description' => 'Manage assigned leads, follow-ups, customer communication'],
            ['name' => 'Marketing Executive', 'description' => 'Import leads, manage campaigns, analyze lead sources'],
            ['name' => 'Viewer', 'description' => 'Read-only access to dashboards and reports'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }
}
