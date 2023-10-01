<?php

// +----------------------------------------------------------------------
// | EasyAdmin
// +----------------------------------------------------------------------
// | PHP交流群: 763822524
// +----------------------------------------------------------------------
// | 开源协议  https://mit-license.org 
// +----------------------------------------------------------------------
// | github开源项目：https://github.com/zhongshaofa/EasyAdmin
// +----------------------------------------------------------------------

namespace app\admin\middleware;

use app\admin\service\SystemLogService;
use app\Request;

/**
 * 系统操作日志中间件
 * Class SystemLog
 * @package app\admin\middleware
 */
class SystemLog
{

    /**
     * 敏感信息字段，日志记录时需要加密
     * @var array
     */
    protected $sensitiveParams = [
        'password',
        'password_again',
        'phone',
        'mobile'
    ];

    public function handle(Request $request, \Closure $next)
    {
        $params = $request->param();
        if (isset($params['s'])) {
            unset($params['s']);
        }
        foreach ($params as $key => $val) {
            in_array($key, $this->sensitiveParams) && $params[$key] = "***********";
        }
        $method = strtolower($request->method());
        $url = $request->url();

        $data = [
            'admin_id'    => session('admin.id'),
            'url'         => $url,
            'method'      => $method,
            'ip'          => $request->ip(),
            'content'     => json_encode($params, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), //不转义斜杠、中文不转码
            'useragent'   => $request->server('http_user_agent'),
            'create_time' => time(),
        ];
        // 由nginx或apache去做请求日志记录更好
        env('app_debug') && trace($data, 'requestDebug');
        // 按月自动创建系统日志分表
        $logService = SystemLogService::instance();
        $logService->detectTable();
        if (in_array($method, ['post', 'put', 'delete'])) {
            $logService->save($data);
        }

        return $next($request);
    }

}