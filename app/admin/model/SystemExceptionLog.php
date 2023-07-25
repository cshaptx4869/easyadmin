<?php

namespace app\admin\model;

use app\common\model\TimeModel;
use Throwable;

class SystemExceptionLog extends TimeModel
{
    protected $name = 'system_exception_log';
    protected $deleteTime = false;

    /**
     * @param Throwable $exception
     */
    static public function report(Throwable $exception)
    {
        self::create([
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'url' => \request()->url(),
            'method' => \request()->method(),
            'param' => print_r(\request()->param(), true),
            'ip' => \request()->ip(),
            'header' => print_r(\request()->header(), true)
        ]);
    }
}