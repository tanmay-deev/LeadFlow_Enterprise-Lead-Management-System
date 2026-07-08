<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Lead;
use Illuminate\Support\Facades\Hash;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user and authenticate
        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'api');
    }

    public function test_can_fetch_leads_list()
    {
        Lead::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/leads');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'data' => [
                         '*' => ['id', 'contact_name', 'email']
                     ],
                     'meta' => ['current_page', 'total']
                 ]);
    }

    public function test_can_create_a_lead()
    {
        $status = \App\Models\LeadStatus::firstOrCreate(['name' => 'New']);
        $data = [
            'contact_name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'priority' => 'high',
            'status_id' => $status->id,
        ];

        $response = $this->postJson('/api/v1/leads', $data);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'contact_name' => 'John Doe',
                     'email' => 'john@example.com'
                 ]);
                 
        $this->assertDatabaseHas('leads', [
            'email' => 'john@example.com'
        ]);
    }
}
