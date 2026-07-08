<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'lead_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
