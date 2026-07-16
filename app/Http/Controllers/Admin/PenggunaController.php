<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PenggunaController extends Controller
{
    /**
     * Display a listing of the pengguna (users).
     */
    public function index(): Response
    {
        return Inertia::render('admin/pengguna/index');
    }
}
