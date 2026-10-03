<?php

namespace App\Support\Tenancy;

use App\Models\Facility;
use Closure;
use RuntimeException;

/**
 * Holds the facility the current request is working for.
 *
 * Every tenant-owned model reads its scope from here, so there is exactly one
 * answer to "whose data is this" and no query string can change it. Switching
 * facility deliberately, which only platform staff should ever do, goes
 * through runUsing() and always restores the previous value.
 */
class CurrentFacility
{
    protected ?Facility $facility = null;

    public function set(?Facility $facility): void
    {
        $this->facility = $facility;
    }

    public function get(): ?Facility
    {
        return $this->facility;
    }

    public function id(): ?int
    {
        return $this->facility?->id;
    }

    public function isSet(): bool
    {
        return $this->facility !== null;
    }

    public function forget(): void
    {
        $this->facility = null;
    }

    /**
     * Run a callback as though another facility were current, then put the
     * previous one back even if the callback throws.
     */
    public function runUsing(?Facility $facility, Closure $callback): mixed
    {
        $previous = $this->facility;

        $this->facility = $facility;

        try {
            return $callback();
        } finally {
            $this->facility = $previous;
        }
    }

    /**
     * Used when a tenant-owned row is created and no facility was named.
     *
     * @throws RuntimeException when nothing is bound, which would otherwise
     *                          silently write a row nobody can read back.
     */
    public function idOrFail(): int
    {
        return $this->id() ?? throw new RuntimeException(
            'No facility is bound to this request, so a tenant-owned row cannot be created.'
        );
    }
}
