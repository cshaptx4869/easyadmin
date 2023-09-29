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

use app\Request;

/**
 * Class CsrfMiddleware
 * PS：路由中间件中可以获取到控制器相关信息
 * @package app\admin\middleware
 */
class CsrfMiddleware
{
    use \app\common\traits\JumpTrait;

    public function handle(Request $request, \Closure $next)
    {
        if (env('EASYADMIN.IS_CSRF', true)) {
            $adminConfig = config('admin');
            $currentNode = parse_name($request->controller() . '/' . $request->action());
            if (!in_array($request->method(), ['GET', 'HEAD', 'OPTIONS']) && !in_array($currentNode, $adminConfig['no_csrf_node'])) {
                // 跨域校验
                $refererUrl = $request->header('REFERER', null);
                $refererInfo = parse_url($refererUrl);
                $host = $request->host(true);
                if (!isset($refererInfo['host']) || $refererInfo['host'] != $host) {
                    $this->error('当前请求不合法！');
                }

                // CSRF校验
                $check = $request->checkToken();
                if (!$check) {
                    $this->error('请求验证失败，请重新刷新页面！');
                }
                if ($request->isAjax()) {
                    return $next($request)->header(['X-CSRF-TOKEN' => token()]);
                }
            }
        }
        return $next($request);
    }
}
