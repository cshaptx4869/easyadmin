define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.node/index',
        add_url: 'system.node/add',
        edit_url: 'system.node/edit',
        delete_url: 'system.node/delete',
        modify_url: 'system.node/modify',
        refresh_url: 'system.node/refreshNode',
        clear_url: 'system.node/clearNode',
    };

    var Controller = {

        index: function () {
            ea.table.render({
                init: init,
                search: false,
                topBar: true,
                page: false,
                toolbar: ['refresh',
                    [{
                        text: '更新',
                        title: '确定更新新节点？',
                        url: init.refresh_url + '?force=0',
                        method: 'request',
                        auth: 'refresh',
                        class: 'layui-btn layuimini-btn-success layui-btn-sm',
                        icon: 'fa fa-hourglass',
                        extend: 'data-table="' + init.table_render_id + '"',
                    }, {
                        text: '强制更新',
                        title: '该操作会覆盖已存在的节点信息。<br>确定强制更新节点？',
                        url: init.refresh_url + '?force=1',
                        method: 'request',
                        auth: 'refresh',
                        class: 'layui-btn layui-btn-sm layui-btn-normal',
                        icon: 'fa fa-hourglass',
                        extend: 'data-table="' + init.table_render_id + '"',
                    }, {

                        text: '清除失效',
                        title: '确定清除失效节点？',
                        url: init.clear_url,
                        method: 'request',
                        auth: 'clear',
                        class: 'layui-btn layui-btn-sm layuimini-btn-danger',
                        icon: 'fa fa-trash-o',
                        extend: 'data-table="' + init.table_render_id + '"',
                    }]
                ],
                cols: [[
                    {field: 'node', minWidth: 200, align: 'left', title: '系统节点'},
                    {field: 'title', minWidth: 80, title: '节点名称 <i class="table-edit-tips color-red">*</i>', align: 'left', edit: 'text'},
                    {field: 'update_time', minWidth: 80, title: '更新时间', search: 'range'},
                    {field: 'is_auth', title: '节点控制', width: 85, search: 'select', selectList: {0: '禁用', 1: '启用'}, templet: ea.table.switch},
                ]],
            });

            ea.listen();
        },
        add: function () {
            ea.listen();
        },
        edit: function () {
            ea.listen();
        }
    };
    return Controller;
});