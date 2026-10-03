<?php

namespace App\Pharmacy\Services\Exceptions;

use RuntimeException;

/**
 * Raised when a request would take stock below zero, or ask for more than a
 * batch or location actually holds.
 */
class InsufficientStock extends RuntimeException {}
