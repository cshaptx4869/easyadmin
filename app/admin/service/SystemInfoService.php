<?php

namespace app\admin\service;

use think\facade\Db;

/**
 * 系统信息
 */
class SystemInfoService
{
    private static $instance;

    private function __construct()
    {
    }

    private function __clone()
    {
    }

    public static function getInstance()
    {
        if (static::$instance === null) {
            static::$instance = new static();
        }
        return static::$instance;
    }

    /**
     * 获取全部信息
     * @param string $name
     * @param string $default
     * @return array|mixed|string
     * @throws \Exception
     */
    public function getAll(string $name = '', string $default = '')
    {
        $composer = json_decode(file_get_contents(root_path() . 'composer.json'), true);
        $requireList = [];
        $requireDevList = [];
        if (array_key_exists('require', $composer)) {
            $requireList = $composer['require'];
        }
        if (array_key_exists('require-dev', $composer)) {
            $requireDevList = $composer['require-dev'];
        }

        $userAgent = request()->header('user-agent');
        if (false !== stripos($userAgent, 'win')) {
            $userOS = 'Windows';
        } elseif (false !== stripos($userAgent, 'mac')) {
            $userOS = 'MAC';
        } elseif (false !== stripos($userAgent, 'linux')) {
            $userOS = 'Linux';
        } elseif (false !== stripos($userAgent, 'unix')) {
            $userOS = 'Unix';
        } elseif (false !== stripos($userAgent, 'bsd')) {
            $userOS = 'BSD';
        } elseif (false !== stripos($userAgent, 'iPad') || false !== stripos($userAgent, 'iPhone')) {
            $userOS = 'IOS';
        } elseif (false !== stripos($userAgent, 'android')) {
            $userOS = 'Android';
        } else {
            $userOS = 'Other';
        }

        if (false !== stripos($userAgent, 'MSIE')) {
            $userBrowser = 'MSIE';
        } elseif (false !== stripos($userAgent, 'Firefox')) {
            $userBrowser = 'Firefox';
        } elseif (false !== stripos($userAgent, 'Chrome')) {
            $userBrowser = 'Chrome';
        } elseif (false !== stripos($userAgent, 'Safari')) {
            $userBrowser = 'Safari';
        } elseif (false !== stripos($userAgent, 'Opera')) {
            $userBrowser = 'Opera';
        } else {
            $userBrowser = 'Other';
        }

        $userIP = request()->ip();
        $ip2region = new \Ip2Region();
        $userIpAddress = $ip2region->simple($userIP);

        $info = [
            //服务器系统
            'server_os' => PHP_OS,
            //服务器描述
            'server_uname' => php_uname(),
            //服务器ip
            'server_ip' => gethostbyname(request()->server('SERVER_NAME')),
            //服务器软件
            'server_software' => request()->server('SERVER_SOFTWARE', php_sapi_name()),
            //服务器端口
            'server_port' => request()->server('SERVER_PORT'),
            //php版本
            'php_version' => PHP_VERSION,
            //运行内存限制
            'memory_limit' => ini_get('memory_limit'),
            //最大文件上传限制
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            //单次上传数量限制
            'max_file_uploads' => ini_get('max_file_uploads'),
            //最大post限制
            'post_max_size' => ini_get('post_max_size'),
            //磁盘剩余容量
            'disk_free' => $this->formatSize(disk_free_space(app()->getRootPath())),
            //ThinkPHP版本
            'think_version' => app()->version(),
            //运行模式
            'php_sapi_name' => PHP_SAPI,
            //当前后台版本
            'admin_version' => sysconfig('site', 'site_version'),
            //mysql版本
            'db_version' => Db::query('SELECT VERSION() AS db_version')[0]['db_version'],
            //php时区
            'timezone' => date_default_timezone_get(),
            //当前时间
            'date_time' => date('Y-m-d H:i:s'),
            //依赖包
            'require_list' => $requireList,
            //依赖包（dev）
            'require_dev_list' => $requireDevList,
            //用户IP
            'user_ip' => $userIP,
            //用户系统
            'user_os' => $userOS,
            //IP所在城市
            'user_ip_address' => $userIpAddress,
            //用户浏览器
            'user_browser' => $userBrowser,
        ];

        return empty($name) ? $info : ($info[$name] ?? $default);
    }

    /**
     * 格式化
     * @param $size
     * @return string
     */
    protected function formatSize($size): string
    {
        $unitArr = ["B", "KB", 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        $unitMaxIndex = count($unitArr) - 1;
        $index = 0;
        while ($size / 1024 > 1) {
            $size /= 1024;
            $index++;
            if ($index >= $unitMaxIndex) {
                break;
            }
        }

        return round($size, 2) . $unitArr[$index];
    }
}
