<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class Followup extends Model
{
    protected static function booted()
    {
        static::addGlobalScope('role_visibility', function (Builder $builder) {
            if (Auth::check()) {
                $user = Auth::user();
                $adminRoles = ['Super Admin', 'Admin', 'Sales Manager'];
                
                if ($user->role && !in_array($user->role->name, $adminRoles)) {
                    $builder->whereHas('lead');
                }
            }
        });
    }

    protected $fillable = [
        'lead_id',
        'assigned_user_id',
        'type',
        'scheduled_at',
        'completed_at',
        'reminder_at',
        'outcome',
        'status',
        'meeting_link',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'reminder_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }
}
