<?php

namespace App\Pharmacy\Services\Exceptions;

use RuntimeException;

/**
 * Raised when a batch, location or lookup does not exist inside the bound
 * facility, or when a batch exists but is not allowed to move.
 */
class StockNotFound extends RuntimeException {}
