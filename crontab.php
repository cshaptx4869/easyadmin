<?php

use Fairy\HttpCrontabService;

require_once "vendor/autoload.php";

date_default_timezone_set('PRC');

if (file_exists('.env')) {
    $env = parse_ini_file('.env', true);
    $server = new HttpCrontabService(isset($env['EASYADMIN']) ? ($env['EASYADMIN']['CRONTAB_BASE_URI'] ?? '') : '');
    $server->setDbConfig($env['DATABASE'] ?? [])
        ->setName('Crontab Http Server')
        ->setSafeKey(isset($env['EASYADMIN']) ? ($env['EASYADMIN']['CRONTAB_SAFE_KEY'] ?? null) : null);
} else {
    $server = new HttpCrontabService();
}

$server->setDebug()->run();
