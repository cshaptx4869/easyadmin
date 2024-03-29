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

return [

    // 不需要验证登录的控制器
    'no_login_controller' => [
        'login',
    ],

    // 不需要验证登录的节点
    'no_login_node'       => [],

    // 不需要验证权限的控制器
    'no_auth_controller'  => [
        'ajax',
        'login',
        'index',
    ],

    // 不需要验证权限的节点
    'no_auth_node'        => [],

    // 不需要演示限制的控制器
    'no_demo_controller'  => [],

    // 不需要演示限制的节点
    'no_demo_node'        => [
        'login/index',
    ],

    // 不需要csrf校验的节点
    'no_csrf_node'        => [
        'ajax/upload',
        'ajax/upload_editor'
    ],

    // 生成csrf token的节点(iframe页从index/index读取、非iframe页需独立生成)
    'csrf_token_node'     => [
        'index/index',
        'login/index'
    ]
];