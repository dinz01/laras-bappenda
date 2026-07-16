<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RetensiArsipController extends Controller
{
    /**
     * Display a listing of the retensi arsip (master data).
     */
    public function index(): Response
    {
        return Inertia::render('master/retensi-arsip/index');
    }
}
