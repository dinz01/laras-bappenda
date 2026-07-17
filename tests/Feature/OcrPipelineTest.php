<?php

use App\Enums\OcrStatus;
use App\Interfaces\OcrServiceInterface;
use App\Jobs\ProcessOcrJob;
use App\Models\Arsip;
use App\Models\DokumenArsip;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('dispatches OCR job on archive store with file', function () {
    Queue::fake();
    Storage::fake('local');

    $user = User::factory()->create();
    $this->actingAs($user);

    $arsipData = Arsip::factory()->raw();
    $arsipData['file'] = UploadedFile::fake()->create('document.pdf', 100);

    $response = $this->post(route('arsip.store'), $arsipData);

    $response->assertRedirect(route('arsip.index'));

    $dokumen = DokumenArsip::first();
    expect($dokumen)->not->toBeNull();

    Queue::assertPushed(ProcessOcrJob::class, function ($job) use ($dokumen) {
        return $job->dokumen->id === $dokumen->id;
    });
});

it('successfully processes OCR job and updates document fields', function () {
    Storage::fake('local');
    $dokumen = DokumenArsip::factory()->create([
        'path_penyimpanan' => 'archives/test.pdf',
        'ocr_status' => OcrStatus::Pending,
    ]);

    $job = new ProcessOcrJob($dokumen);
    // Execute job synchronously using resolved dependencies
    app()->call([$job, 'handle']);

    $dokumen->refresh();
    expect($dokumen->ocr_status)->toBe(OcrStatus::Completed)
        ->and($dokumen->ocr_text)->not->toBeEmpty()
        ->and($dokumen->ocr_confidence)->toBeGreaterThan(0)
        ->and($dokumen->ocr_pages)->toBeGreaterThanOrEqual(1)
        ->and($dokumen->ocr_processed_at)->not->toBeNull();
});

it('handles OCR failure and updates status to failed', function () {
    Storage::fake('local');
    $dokumen = DokumenArsip::factory()->create([
        'path_penyimpanan' => 'archives/test.pdf',
        'ocr_status' => OcrStatus::Pending,
    ]);

    // Create a mock service that fails
    $failingOcrService = Mockery::mock(OcrServiceInterface::class);
    $failingOcrService->shouldReceive('analyze')->andThrow(new RuntimeException('OCR Service Error'));

    $job = new ProcessOcrJob($dokumen);
    $job->handle($failingOcrService);

    $dokumen->refresh();
    expect($dokumen->ocr_status)->toBe(OcrStatus::Failed)
        ->and($dokumen->ocr_text)->toBeNull()
        ->and($dokumen->ocr_confidence)->toBeNull();
});

it('dispatches OCR job again on reprocess', function () {
    Queue::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    $arsip = Arsip::factory()->create();
    $dokumen = DokumenArsip::factory()->create([
        'arsip_id' => $arsip->id,
        'ocr_status' => OcrStatus::Failed, // allow reprocess
    ]);

    $response = $this->post(route('arsip.ocr-reprocess', $arsip));

    $response->assertRedirect(route('arsip.show', $arsip));
    $response->assertSessionHas('success');

    Queue::assertPushed(ProcessOcrJob::class, function ($job) use ($dokumen) {
        return $job->dokumen->id === $dokumen->id;
    });
});
