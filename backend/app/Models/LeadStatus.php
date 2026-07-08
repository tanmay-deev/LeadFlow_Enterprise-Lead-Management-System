<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadStatus extends Model
{
    protected $fillable = ['name', 'display_order', 'color', 'is_closed'];

    protected $casts = [
        'is_closed' => 'boolean',
        'display_order' => 'integer',
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'status_id');
    }
}
