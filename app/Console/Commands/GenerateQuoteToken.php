<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Console\Command\Command as SymfonyCommand;

#[Signature('tibadesk:quote-token {--show : Print the token already configured, if any}')]
#[Description('Generate the shared token that guards the internal subscription quote endpoints')]
class GenerateQuoteToken extends Command
{
    public function handle(): int
    {
        $configured = (string) config('tibadesk.quote_token');

        if ($this->option('show')) {
            if ($configured === '') {
                $this->components->warn('No quote token is configured. Set TIBADESK_QUOTE_TOKEN in your .env file.');

                return SymfonyCommand::FAILURE;
            }

            $this->line($configured);

            return SymfonyCommand::SUCCESS;
        }

        $token = 'tbsq_'.bin2hex(random_bytes(24));

        $this->writeToEnvironmentFile($token);

        $this->components->info('Quote token generated.');
        $this->components->twoColumnDetail('Token', $token);
        $this->components->twoColumnDetail('Stored in', base_path('.env'));
        $this->components->warn('This token is the only thing protecting customer contact details and quoted amounts. Keep it out of version control.');

        return SymfonyCommand::SUCCESS;
    }

    /**
     * Persist the token in the environment file, replacing any previous value so
     * rotating the token is the same command as creating it.
     */
    private function writeToEnvironmentFile(string $token): void
    {
        $path = base_path('.env');
        $line = 'TIBADESK_QUOTE_TOKEN='.$token;

        if (! is_file($path)) {
            File::put($path, $line.PHP_EOL);

            return;
        }

        $contents = File::get($path);

        $updated = preg_match('/^TIBADESK_QUOTE_TOKEN=.*$/m', $contents) === 1
            ? preg_replace('/^TIBADESK_QUOTE_TOKEN=.*$/m', $line, $contents)
            : rtrim($contents).PHP_EOL.$line.PHP_EOL;

        File::put($path, $updated);
    }
}
