define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.uploadfile/index',
        add_url: 'system.uploadfile/add',
        edit_url: 'system.uploadfile/edit',
        delete_url: 'system.uploadfile/delete',
        modify_url: 'system.uploadfile/modify',
        export_url: 'system.uploadfile/export',
    };

    return {
        index: function () {
            ea.table.render({
                init: init,
                align: 'left',
                cellMinWidth: 80,
                cols: [[
                    {type: "checkbox"},
                    {field: 'id', title: 'ID'},
                    {field: 'upload_type', title: '存储位置', search: 'select', selectList: {'local': '本地', 'alioss': '阿里云', 'qnoss': '七牛云', ',txcos': '腾讯云'}},
                    {field: 'url', title: '文件预览', templet: ea.table.image, search: false},
                    {field: 'url', minWidth: 120, title: '保存地址', templet: ea.table.url, search: false},
                    {field: 'original_name', title: '文件原名'},
                    {field: 'mime_type', title: 'mime类型'},
                    {field: 'file_ext', title: '文件后缀'},
                    {field: 'file_size', title: '文件大小', templet: ea.table.byte, search: false},
                    {field: 'sha1', title: '哈希', search: false},
                    {field: 'create_time', title: '创建时间', search: 'range'},
                    {title: '操作', templet: ea.table.tool, operat: ['delete']}
                ]],
            });

            ea.listen();
        },
        add: function () {
            $('button').click(function () {
                var refreshTable = $('[name="url"]').val().trim().length > 0 ? init.table_render_id : false;
                ea.api.closeCurrentOpen({
                    refreshTable: refreshTable
                });
            });
            ea.listen();
        }
    };
});
