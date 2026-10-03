<?php

namespace App\Http\Controllers;

use App\Models\Option;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OptionsController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'category' => 'sometimes|string|max:100',
        ]);

        $query = Option::active()
            ->orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($request->filled('category')) {
            $options = $query->where('category', $request->category)->get();

            return $this->sendResponse(
                $options->map(fn ($option) => [
                    'label' => $option->label,
                    'value' => $option->value,
                ])->values(),
                Response::HTTP_OK,
                'Success.'
            );
        }

        $grouped = $query->get()->groupBy('category')->map(function ($options) {
            return $options->map(fn ($option) => [
                'label' => $option->label,
                'value' => $option->value,
            ])->values();
        });

        return $this->sendResponse($grouped, Response::HTTP_OK, 'Success.');
    }
}