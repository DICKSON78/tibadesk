<?php

namespace App\Services;

use App\Models\Facility;
use App\Support\Tenancy\CurrentFacility;
use Illuminate\Support\Facades\DB;

/**
 * Hands out the printable reference on a patient, encounter or consultation.
 *
 * Numbers restart at 1 for every facility, because they are read aloud at the
 * counter and printed on documents that never leave the building. The counter
 * lives in its own row and is locked for the duration of the increment, which
 * is what makes two simultaneous registrations safe; a COUNT() over existing
 * rows would not be.
 */
class DocumentNumberGenerator
{
    public const PATIENT = 'patients';

    public const ENCOUNTER = 'encounters';

    public const CONSULTATION = 'consultations';

    public const INVOICE = 'invoices';

    public const PURCHASE_ORDER = 'purchase_orders';

    public const STOCK_TRANSFER = 'stock_transfers';

    public const STOCK_RETURN = 'stock_returns';

    public const WRITEOFF = 'writeoffs';

    public const RECALL = 'recalls';

    private const PREFIXES = [
        self::PATIENT => 'P',
        self::ENCOUNTER => 'OPD',
        self::CONSULTATION => 'CONS',
        self::INVOICE => 'INV',
        self::PURCHASE_ORDER => 'PO',
        self::STOCK_TRANSFER => 'TRF',
        self::STOCK_RETURN => 'RET',
        self::WRITEOFF => 'WOF',
        self::RECALL => 'RC',
    ];

    private const WIDTHS = [
        self::PATIENT => 6,
        self::ENCOUNTER => 6,
        self::CONSULTATION => 6,
        self::INVOICE => 6,
        self::PURCHASE_ORDER => 6,
        self::STOCK_TRANSFER => 6,
        self::STOCK_RETURN => 6,
        self::WRITEOFF => 6,
        self::RECALL => 6,
    ];

    /**
     * The next number for a series, formatted with its prefix.
     *
     * The caller is expected to already be inside a transaction, since the
     * number is only meaningful if the row that carries it is committed too.
     */
    public function next(Facility $facility, string $kind): string
    {
        return DB::transaction(function () use ($facility, $kind): string {
            $sequence = DB::table('document_sequences')
                ->where('facility_id', $facility->getKey())
                ->where('kind', $kind)
                ->lockForUpdate()
                ->first();

            if ($sequence === null) {
                $number = 1;

                DB::table('document_sequences')->insert([
                    'facility_id' => $facility->getKey(),
                    'kind' => $kind,
                    'next_number' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $number = (int) $sequence->next_number;

                DB::table('document_sequences')
                    ->where('id', $sequence->id)
                    ->update([
                        'next_number' => $number + 1,
                        'updated_at' => now(),
                    ]);
            }

            return $this->format($kind, $number);
        });
    }

    /**
     * The next number for whichever facility is bound to the request.
     */
    public function nextForCurrent(string $kind): string
    {
        $facility = app(CurrentFacility::class)->get();

        abort_if($facility === null, 500, 'No facility is bound to this request.');

        return $this->next($facility, $kind);
    }

    public function format(string $kind, int $number): string
    {
        return (self::PREFIXES[$kind] ?? 'DOC').'-'.str_pad((string) $number, self::WIDTHS[$kind] ?? 6, '0', STR_PAD_LEFT);
    }
}
