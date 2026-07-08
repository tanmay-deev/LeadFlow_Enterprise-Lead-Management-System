<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'lead.view'],
            ['name' => 'lead.create'],
            ['name' => 'lead.edit'],
            ['name' => 'lead.delete'],
            ['name' => 'lead.assign'],
            ['name' => 'followup.create'],
            ['name' => 'report.view'],
            ['name' => 'report.export'],
            ['name' => 'user.manage'],
            ['name' => 'settings.manage'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']]);
        }
    }
}
