<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pengelolaan;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RecordCenterController extends Controller
{
    /**
     * Display a listing of the record center.
     */
    public function index(): Response
    {
        return Inertia::render('pengelolaan/record-center/index');
    }
}
