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


use app\admin\service\ConfigService;
use think\facade\View;
use think\Request;

/**
 * 初始化视图参数
 * Class ViewInit
 * @package app\admin\middleware
 */
class ViewInit
{

    public function handle(Request $request, \Closure $next)
    {
        list($thisModule, $thisController, $thisAction) = [app('http')->getName(), $request->controller(), $request->action()];
        list($thisControllerArr, $jsPath) = [explode('.', $thisController), null];
        foreach ($thisControllerArr as $vo) {
            empty($jsPath) ? $jsPath = parse_name($vo) : $jsPath .= '/' . parse_name($vo);
        }
        $autoloadJs = file_exists(root_path('public') . "static/{$thisModule}/js/{$jsPath}.js");
        $thisControllerJsPath = "{$thisModule}/js/{$jsPath}.js";
        $adminModuleName = config('app.admin_alias_name');
        $isSuperAdmin = is_super_admin();
        $csrfToken = '';
        if (env('easyadmin.is_csrf', true)) {
            $adminConfig = config('admin');
            $currentNode = parse_name($thisController . '/' . $thisAction);
            if (!in_array($currentNode, config('admin.no_csrf_node')) &&
                $request->method() === 'GET' &&
                in_array($currentNode, $adminConfig['csrf_token_node'])) {
                $csrfToken = token();
            }
        }

        $data = [
            'adminModuleName'      => $adminModuleName,
            'thisController'       => parse_name($thisController),
            'thisAction'           => $thisAction,
            'thisRequest'          => parse_name("{$thisModule}/{$thisController}/{$thisAction}"),
            'thisControllerJsPath' => $thisControllerJsPath,
            'autoloadJs'           => $autoloadJs,
            'isSuperAdmin'         => $isSuperAdmin,
            'version'              => env('app_debug') ? time() : ConfigService::getVersion(),
            'csrfToken'            => $csrfToken
        ];

        View::assign($data);
        $request->adminModuleName = $adminModuleName;
        return $next($request);
    }


}
