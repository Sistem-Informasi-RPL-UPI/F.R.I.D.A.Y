<?php

it('boots through the operational health route without frontend assets', function (): void {
    $this->get('/up')->assertOk();
});

it('rejects unsafe test configuration before database work', function (string $key, string $value): void {
    $originalEnv = $_ENV[$key] ?? null;
    $originalServer = $_SERVER[$key] ?? null;
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;

    try {
        expect(fn () => $this->createApplication())
            ->toThrow(RuntimeException::class, 'Tests require the isolated MySQL friday_test database');
    } finally {
        if ($originalEnv === null) {
            unset($_ENV[$key]);
        } else {
            $_ENV[$key] = $originalEnv;
        }

        if ($originalServer === null) {
            unset($_SERVER[$key]);
        } else {
            $_SERVER[$key] = $originalServer;
        }
    }
})->with([
    'non-testing environment' => ['APP_ENV', 'production'],
    'different database driver' => ['DB_CONNECTION', 'sqlite'],
    'development schema' => ['DB_DATABASE', 'friday_dev'],
    'URL override' => ['DB_URL', 'mysql://localhost/friday_dev'],
]);
