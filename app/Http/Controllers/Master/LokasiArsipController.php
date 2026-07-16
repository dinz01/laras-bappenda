<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LokasiArsipController extends Controller
{
    /**
     * Display a listing of the lokasi arsip.
     */
    public function index(): Response
    {
        return Inertia::render('master/lokasi-arsip/index');
    }
}
