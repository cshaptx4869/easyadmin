<?php
// +----------------------------------------------------------------------
// | 路由设置
// +----------------------------------------------------------------------

return [

    // 路由中间件
    'middleware' => [

        // 后台视图初始化
        \app\admin\middleware\ViewInit::class,

        // 检测用户是否登录
        \app\admin\middleware\CheckAdmin::class,

        // Csrf安全校验
        \app\admin\middleware\CsrfMiddleware::class,
    ],
];
