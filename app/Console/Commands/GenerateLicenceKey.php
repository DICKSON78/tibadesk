<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Console\Command\Command as SymfonyCommand;

#[Signature('tibadesk:licence-key {--force : Overwrite an existing key pair}')]
#[Description('Generate the Ed25519 key pair used to sign customer licence files')]
class GenerateLicenceKey extends Command
{
    public function handle(): int
    {
        $privatePath = config('tibadesk.licence.private_key_path');
        $publicPath = config('tibadesk.licence.public_key_path');

        if (! $this->option('force') && is_file($privatePath)) {
            $this->components->error('A licence key already exists. Pass --force to replace it.');
            $this->components->warn('Replacing it invalidates every licence already issued.');

            return SymfonyCommand::FAILURE;
        }

        File::ensureDirectoryExists(dirname($privatePath));
        File::ensureDirectoryExists(dirname($publicPath));

        $keyPair = sodium_crypto_sign_keypair();
        $secret = sodium_crypto_sign_secretkey($keyPair);
        $public = sodium_crypto_sign_publickey($keyPair);

        File::put($privatePath, 'base64:'.base64_encode($secret));
        File::put($publicPath, base64_encode($public));
        chmod($privatePath, 0600);

        $this->components->info('Licence key pair generated.');
        $this->components->twoColumnDetail('Private key', $privatePath);
        $this->components->twoColumnDetail('Public key', $publicPath);
        $this->components->warn('The public key is embedded in the TibaDesk installer. The private key never leaves this server.');

        return SymfonyCommand::SUCCESS;
    }
}
