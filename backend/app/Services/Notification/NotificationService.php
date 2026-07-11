<?php

namespace App\Services\Notification;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Send a notification to a specific user.
     * Does not send if the target user is the current authenticated user.
     *
     * @param int|null $userId
     * @param string $title
     * @param string $message
     * @param string $type
     * @return \App\Models\Notification|null
     */
    public function send(?int $userId, string $title, string $message, string $type = 'info')
    {
        if (!$userId) {
            return null;
        }

        // Don't notify the user about their own actions
        if (Auth::check() && Auth::id() == $userId) {
            return null;
        }

        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
        ]);
    }
}
