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

namespace EasyAdmin\upload\trigger;


use think\facade\Db;

/**
 * 保存到数据库
 * Class SaveDb
 * @package EasyAdmin\upload\trigger
 */
class SaveDb
{

    /**
     * 保存上传文件
     * @param $tableName
     * @param $data
     */
    public static function trigger($tableName, $data)
    {
        if (isset($data['original_name'])) {
            $data['original_name'] = htmlspecialchars($data['original_name'], ENT_QUOTES);
        }
        Db::name($tableName)->save($data);
    }

    /**
     * 哈希文件
     * @param $tableName
     * @param $sha1
     * @return array|mixed|Db|\think\Model|null
     */
    public static function sha1File($tableName, $sha1)
    {
        return Db::name($tableName)->where('sha1', $sha1)->find();
    }
}