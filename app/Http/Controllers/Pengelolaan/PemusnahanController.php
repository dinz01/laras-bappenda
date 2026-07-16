<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pengelolaan;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PemusnahanController extends Controller
{
    /**
     * Display a listing of the pemusnahan arsip.
     */
    public function index(): Response
    {
        return Inertia::render('pengelolaan/pemusnahan/index');
    }
}
