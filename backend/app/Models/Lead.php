<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted()
    {
        static::addGlobalScope('role_visibility', function (Builder $builder) {
            if (Auth::check()) {
                $user = Auth::user();
                $adminRoles = ['Super Admin', 'Admin', 'Sales Manager'];
                
                if ($user->role && !in_array($user->role->name, $adminRoles)) {
                    $builder->where(function ($q) use ($user) {
                        $q->where('leads.assigned_user_id', $user->id)
                          ->orWhere('leads.created_by', $user->id);
                    });
                }
            }
        });
    }

    protected $fillable = [
        'assigned_user_id',
        'source_id',
        'status_id',
        'company_name',
        'contact_name',
        'email',
        'phone',
        'address',
        'industry',
        'campaign',
        'product',
        'budget',
        'priority',
        'follow_up_date',
        'tags',
        'notes_summary',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'follow_up_date' => 'datetime',
        'tags' => 'array',
        'budget' => 'decimal:2',
    ];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class, 'source_id');
    }

    public function status()
    {
        return $this->belongsTo(LeadStatus::class, 'status_id');
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function notes()
    {
        return $this->hasMany(LeadNote::class);
    }

    public function documents()
    {
        return $this->hasMany(LeadDocument::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
