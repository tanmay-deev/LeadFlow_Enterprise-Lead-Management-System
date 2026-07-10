<?php

namespace App\Http\Requests\Followup;

use Illuminate\Foundation\Http\FormRequest;

class StoreFollowupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lead_id' => ['required', 'exists:leads,id'],
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'type' => ['required', 'in:call,email,meeting,visit,whatsapp'],
            'scheduled_at' => ['required', 'date'],
            'reminder_at' => ['nullable', 'date', 'after_or_equal:now'],
            'meeting_link' => ['nullable', 'string', 'max:500'],
        ];
    }
}
