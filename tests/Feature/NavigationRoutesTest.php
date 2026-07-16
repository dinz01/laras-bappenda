<?php

use App\Models\User;

$routes = [
    'record-center.index',
    'pemusnahan.index',
    'permohonan.index',
    'master.unit-organisasi.index',
    'master.jabatan.index',
    'master.klasifikasi-arsip.index',
    'master.lokasi-arsip.index',
    'master.jenis-arsip.index',
    'master.media-arsip.index',
    'master.retensi-arsip.index',
    'admin.pengguna.index',
    'admin.role.index',
    'admin.permission.index',
    'admin.audit-log.index',
];

test('guests are redirected to the login page from navigation routes', function () use ($routes) {
    foreach ($routes as $routeName) {
        $response = $this->get(route($routeName));
        $response->assertRedirect(route('login'));
    }
});

test('authenticated users can visit the navigation routes', function () use ($routes) {
    $user = User::factory()->create();
    $this->actingAs($user);

    foreach ($routes as $routeName) {
        $response = $this->get(route($routeName));
        $response->assertOk();
    }
});
