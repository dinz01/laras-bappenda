<?php

use App\DTOs\OcrResult;
use App\Services\MockOcrService;

it('extracts text from fake file path using mock service', function () {
    $service = new MockOcrService;
    $text = $service->extractText('archives/dummy.pdf');

    expect($text)->toBeString()
        ->and($text)->not->toBeEmpty();
});

it('analyzes fake file path using mock service and returns OcrResult DTO', function () {
    $service = new MockOcrService;
    $result = $service->analyze('archives/dummy.pdf');

    expect($result)->toBeInstanceOf(OcrResult::class)
        ->and($result->text)->toBeString()
        ->and($result->text)->not->toBeEmpty()
        ->and($result->pages)->toBeGreaterThanOrEqual(1)
        ->and($result->language)->toBe('id')
        ->and($result->confidence)->toBeGreaterThanOrEqual(85.0)
        ->and($result->confidence)->toBeLessThanOrEqual(99.0)
        ->and($result->processedAt)->toBeString()
        ->and($result->processingTimeMs)->toBeGreaterThanOrEqual(0);
});

it('reports service health as true', function () {
    $service = new MockOcrService;
    expect($service->health())->toBeTrue();
});
