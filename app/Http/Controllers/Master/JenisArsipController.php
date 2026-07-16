<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class JenisArsipController extends Controller
{
    /**
     * Display a listing of the jenis arsip.
     */
    public function index(): Response
    {
        return Inertia::render('master/jenis-arsip/index');
    }
}
