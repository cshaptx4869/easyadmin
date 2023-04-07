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
        $backtrace = debug_backtrace();
        $firstTrace = array_shift($backtrace);
        self::create([
            'message' => $exception->getMessage(),
            'code' => $exception->getCode(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'caller_file' => $firstTrace['file'] ?? '',
            'caller_line' => $firstTrace['line'] ?? ''
        ]);
    }
}