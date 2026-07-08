<?php

namespace App\Traits;

trait ApiResponse
{
    protected function successResponse($data = [], $message = 'Success', $code = 200, $meta = null)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => empty($data) ? (object)[] : $data,
            'meta' => $meta,
        ], $code);
    }

    protected function errorResponse($message = 'Error', $errors = [], $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => empty($errors) ? (object)[] : $errors,
        ], $code);
    }
}
