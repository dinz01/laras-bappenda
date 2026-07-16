<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class JabatanController extends Controller
{
    /**
     * Display a listing of the jabatan.
     */
    public function index(): Response
    {
        return Inertia::render('master/jabatan/index');
    }
}
