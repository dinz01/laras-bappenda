<?php

declare(strict_types=1);

namespace App\Support;

use Carbon\CarbonInterface;
use DateTimeInterface;
use Illuminate\Support\Carbon;

class AppDateTime
{
    public static function iso(DateTimeInterface|string|null $value): ?string
    {
        return self::parse($value)?->toIso8601String();
    }

    public static function date(DateTimeInterface|string|null $value): ?string
    {
        return self::parse($value)?->format('d M Y');
    }

    public static function inputDate(DateTimeInterface|string|null $value): ?string
    {
        return self::parse($value)?->format('Y-m-d');
    }

    public static function dateTime(DateTimeInterface|string|null $value): ?string
    {
        return self::parse($value)?->format('d M Y H:i T');
    }

    private static function parse(DateTimeInterface|string|null $value): ?CarbonInterface
    {
        if ($value === null) {
            return null;
        }

        $date = $value instanceof CarbonInterface
            ? $value
            : Carbon::parse($value);

        return $date->setTimezone((string) config('app.timezone'));
    }
}
