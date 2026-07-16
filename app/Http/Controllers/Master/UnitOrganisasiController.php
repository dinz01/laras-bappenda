<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class UnitOrganisasiController extends Controller
{
    /**
     * Display a listing of the unit organisasi.
     */
    public function index(): Response
    {
        return Inertia::render('master/unit-organisasi/index');
    }
}
