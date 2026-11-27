<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = parent::createApplication();

        if (! $app->environment('testing')
            || $app['config']->get('database.default') !== 'mysql'
            || $app['config']->get('database.connections.mysql.database') !== 'friday_test'
            || filled($app['config']->get('database.connections.mysql.url'))) {
            throw new RuntimeException('Tests require the isolated MySQL friday_test database without a DB_URL override.');
        }

        return $app;
    }
}
