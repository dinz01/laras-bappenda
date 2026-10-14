<?php

use App\Enums\WorkflowStatus;
use App\Models\Arsip;
use App\Models\UnitOrganisasi;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(PermissionSeeder::class);
});

it('redirects guest to login from nasib akhir arsip page', function () {
    $this->get(route('nasib-akhir-arsip.index'))
        ->assertRedirect(route('login'));
});

it('allows super admin to see all destruction and retention archives across units', function () {
    $admin = superAdmin();

    $unitA = UnitOrganisasi::factory()->create();
    $unitB = UnitOrganisasi::factory()->create();

    Arsip::factory()->create([
        'unit_organisasi_id' => $unitA->id,
        'workflow_status' => WorkflowStatus::Musnah,
        'judul' => 'Arsip Unit A',
    ]);
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitB->id,
        'workflow_status' => WorkflowStatus::Musnah,
        'judul' => 'Arsip Unit B',
    ]);

    $this->actingAs($admin)
        ->get(route('nasib-akhir-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pengelolaan/nasib-akhir-arsip/index')
            ->has('arsips.data', 2)
        );
});

it('restricts operator to only see destruction archives from their own unit', function () {
    $unitA = UnitOrganisasi::factory()->create();
    $unitB = UnitOrganisasi::factory()->create();

    $operator = User::factory()->create(['unit_organisasi_id' => $unitA->id]);
    $operator->assignRole('Operator Unit');

    // Arsip di unit milik operator (Destruction)
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitA->id,
        'workflow_status' => WorkflowStatus::Musnah,
        'judul' => 'Arsip Nasib Akhir Unit Saya',
    ]);

    // Arsip di unit lain (Destruction)
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitB->id,
        'workflow_status' => WorkflowStatus::Musnah,
        'judul' => 'Arsip Nasib Akhir Unit Lain',
    ]);

    // Arsip di unit milik operator tetapi status bukan Destruction / Retention
    Arsip::factory()->create([
        'unit_organisasi_id' => $unitA->id,
        'workflow_status' => WorkflowStatus::Active,
        'judul' => 'Arsip Aktif Unit Saya',
    ]);

    $this->actingAs($operator)
        ->get(route('nasib-akhir-arsip.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('pengelolaan/nasib-akhir-arsip/index')
            ->has('arsips.data', 1)
            ->where('arsips.data.0.judul', 'Arsip Nasib Akhir Unit Saya')
            ->has('unitOrganisasis', 0)
        );
});

it('allows super admin, arsiparis, and pimpinan to delete musnah archive', function (string $role) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $arsip = Arsip::factory()->create([
        'workflow_status' => WorkflowStatus::Musnah,
    ]);

    $this->actingAs($user)
        ->from(route('nasib-akhir-arsip.index'))
        ->delete(route('arsip.destroy', $arsip->id))
        ->assertRedirect(route('nasib-akhir-arsip.index'));

    $this->assertSoftDeleted('arsip', ['id' => $arsip->id]);
    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Arsip::class,
        'auditable_id' => $arsip->id,
        'event' => 'arsip.deleted',
    ]);
})->with(['Super Administrator', 'Arsiparis', 'Pimpinan']);

it('allows super admin, arsiparis, and pimpinan to bulk delete musnah archives', function (string $role) {
    $user = User::factory()->create();
    $user->assignRole($role);

    $arsip1 = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Musnah]);
    $arsip2 = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Musnah]);

    $this->actingAs($user)
        ->from(route('nasib-akhir-arsip.index'))
        ->post(route('arsip.bulk-delete'), [
            'ids' => [$arsip1->id, $arsip2->id],
        ])
        ->assertRedirect(route('nasib-akhir-arsip.index'));

    $this->assertSoftDeleted('arsip', ['id' => $arsip1->id]);
    $this->assertSoftDeleted('arsip', ['id' => $arsip2->id]);
})->with(['Super Administrator', 'Arsiparis', 'Pimpinan']);

it('forbids operator from bulk deleting archives', function () {
    $operator = User::factory()->create();
    $operator->assignRole('Operator Unit');

    $arsip = Arsip::factory()->create(['workflow_status' => WorkflowStatus::Musnah]);

    $this->actingAs($operator)
        ->post(route('arsip.bulk-delete'), [
            'ids' => [$arsip->id],
        ])
        ->assertForbidden();

    $this->assertNotSoftDeleted('arsip', ['id' => $arsip->id]);
});
