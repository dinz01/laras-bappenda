<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MediaArsipController extends Controller
{
    /**
     * Display a listing of the media arsip.
     */
    public function index(): Response
    {
        return Inertia::render('master/media-arsip/index');
    }
}
