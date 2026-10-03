<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RespondsWithCatalogue;
use Illuminate\Http\JsonResponse;

class PackageController
{
    use RespondsWithCatalogue;

    public function index(): JsonResponse
    {
        return $this->catalogue();
    }
}
