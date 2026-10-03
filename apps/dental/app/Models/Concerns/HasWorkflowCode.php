<?php

namespace App\Models\Concerns;

/**
 * Resolves a stable workflow `code` (set at seed time and never renames) to a
 * DB row id, falling back to the canonical display name for rows created
 * before codes existed. Using the returned id keeps routing logic immune to
 * display-name renames done in the Settings modules.
 */
trait HasWorkflowCode
{
    public static array $workflowIdCache = [];

    /**
     * @return array<string, string[]> map of code => default display names
     */
    abstract public static function codeAliases(): array;

    public static function idForCode(string $code): ?int
    {
        if (array_key_exists($code, static::$workflowIdCache)) {
            return static::$workflowIdCache[$code];
        }

        $id = static::query()->where('code', $code)->value('id');

        if (!$id) {
            $names = static::codeAliases()[$code] ?? [];
            if ($names) {
                $id = static::query()->whereIn('name', $names)->value('id');
            }
        }

        static::$workflowIdCache[$code] = $id ?: null;

        return static::$workflowIdCache[$code];
    }
}