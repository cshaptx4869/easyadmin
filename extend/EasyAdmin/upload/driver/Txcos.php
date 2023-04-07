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

namespace EasyAdmin\upload\driver;

use EasyAdmin\upload\FileBase;
use EasyAdmin\upload\driver\txcos\Cos;
use EasyAdmin\upload\trigger\SaveDb;

/**
 * 腾讯云上传
 * Class Txcos
 * @package EasyAdmin\upload\driver
 */
class Txcos extends FileBase
{

    /**
     * 重写上传方法
     * @return array|void
     */
    public function save()
    {
        $hashFile = SaveDb::sha1File($this->tableName, $this->file->hash());
        if ($hashFile) {
            return [
                'save' => true,
                'msg'  => '上传成功',
                'url'  => $hashFile['url'],
            ];
        } else {
            parent::save();
            $upload = Cos::instance($this->uploadConfig)
                ->save($this->completeFilePath, $this->completeFilePath);
            if ($upload['save'] == true) {
                SaveDb::trigger($this->tableName, [
                    'upload_type'   => $this->uploadType,
                    'original_name' => $this->file->getOriginalName(),
                    'mime_type'     => $this->file->getOriginalMime(),
                    'file_ext'      => strtolower($this->file->getOriginalExtension()),
                    'file_size'     => $this->file->getSize(),
                    'sha1'          => $this->file->hash(),
                    'url'           => $upload['url'],
                    'create_time'   => time(),
                ]);
            }
            $this->rmLocalSave();
            return $upload;
        }
    }

}