<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can access repositori, kelola, and klasifikasi arsip pages', function () {
    $user = superAdmin();
    $this->actingAs($user);

    $responseArsip = $this->get(route('arsip.index'));
    expect($responseArsip->status())->toBe(200);

    $responseKelola = $this->get(route('kelola-arsip.index'));
    expect($responseKelola->status())->toBe(200);

    $responseKlasifikasi = $this->get(route('master.klasifikasi-arsip.index'));
    expect($responseKlasifikasi->status())->toBe(200);
});
