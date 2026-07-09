<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lead;
use App\Models\User;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('query');

        if (empty($query)) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'leads' => [],
                    'users' => []
                ]
            ]);
        }

        $leads = Lead::where('contact_name', 'like', '%' . $query . '%')
            ->orWhere('company_name', 'like', '%' . $query . '%')
            ->orWhere('email', 'like', '%' . $query . '%')
            ->select('id', 'contact_name', 'company_name', 'email')
            ->limit(5)
            ->get()
            ->map(function ($lead) {
                return [
                    'id' => $lead->id,
                    'title' => $lead->contact_name,
                    'subtitle' => $lead->company_name ?? $lead->email,
                    'type' => 'lead'
                ];
            });

        $users = User::where('first_name', 'like', '%' . $query . '%')
            ->orWhere('last_name', 'like', '%' . $query . '%')
            ->orWhere('email', 'like', '%' . $query . '%')
            ->select('id', 'first_name', 'last_name', 'email')
            ->limit(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'title' => trim($user->first_name . ' ' . $user->last_name),
                    'subtitle' => $user->email,
                    'type' => 'user'
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'leads' => $leads,
                'users' => $users
            ]
        ]);
    }
}
