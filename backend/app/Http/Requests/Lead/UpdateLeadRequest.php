<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['nullable', 'string', 'max:255'],
            'contact_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'industry' => ['nullable', 'string', 'max:255'],
            'campaign' => ['nullable', 'string', 'max:255'],
            'product' => ['nullable', 'string', 'max:255'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'status_id' => ['sometimes', 'required', 'exists:lead_statuses,id'],
            'source_id' => ['nullable', 'exists:lead_sources,id'],
            'assigned_user_id' => ['nullable', 'exists:users,id'],
            'tags' => ['nullable', 'array'],
        ];
    }
}
