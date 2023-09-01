<?php
// +----------------------------------------------------------------------
// | 定时器设置
// +----------------------------------------------------------------------

use think\facade\Env;

return [
    // 定时器名称
    'name'     => 'Http Crontab Server',
    // debug模式
    'debug'    => false,
    // socket 上下文选项
    'context'  => [],
    // 请求地址
    'base_uri' => Env::get('easyadmin.crontab_base_uri', 'http://127.0.0.1:2345'),
    // 安全秘钥
    'safe_key' => Env::get('easyadmin.crontab_safe_key', 'Q85gb1ncuWDsZTVoAEvymrNHhaRtp73M'),
    // mysql数据库
    'database' => [
        // 服务器地址
        'hostname' => Env::get('database.hostname', '127.0.0.1'),
        // 端口
        'hostport' => Env::get('database.hostport', '3306'),
        // 用户名
        'username' => Env::get('database.username', 'root'),
        // 密码
        'password' => Env::get('database.password', 'root'),
        // 数据库名
        'database' => Env::get('database.database', 'easyadmin'),
        // 数据库编码默认采用utf8
        'charset'  => Env::get('database.charset', 'utf8'),
        // 数据库表前缀
        'prefix'   => Env::get('database.prefix', 'ea_'),
    ],
    // 数据表
    'table' => [
        // 任务表
        'task'      => 'system_crontab',
        // 任务日志表
        'task_log'  => 'system_crontab_flow',
        // 任务锁表
        'task_lock' => 'system_crontab_lock',
    ]
];