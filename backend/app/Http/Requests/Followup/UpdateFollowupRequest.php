<?php

namespace App\Http\Requests\Followup;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFollowupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'type' => ['nullable', 'in:call,email,meeting,visit,whatsapp'],
            'scheduled_at' => ['nullable', 'date'],
            'reminder_at' => ['nullable', 'date'],
            'status' => ['nullable', 'in:pending,completed,missed'],
            'outcome' => ['nullable', 'string'],
        ];
    }
}
