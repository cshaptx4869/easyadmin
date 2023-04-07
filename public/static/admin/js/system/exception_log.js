define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.exception_log/index',
    };

    return {

        index: function () {
            ea.table.render({
                init: init,
                toolbar: ['refresh'],
                cols: [[
                    {field: 'id', title: 'ID', search: false},
                    {field: 'message', title: '异常消息内容'},
                    {field: 'code', title: '异常代码'},
                    {field: 'file', title: '创建异常者文件'},
                    {field: 'line', title: '创建异常者行号'},
                    {field: 'trace', title: '异常追踪信息', search: false},
                    {field: 'caller_file', title: '方法调用者文件'},
                    {field: 'caller_line', title: '方法调用者行号'},
                    {field: 'create_time', title: '创建时间', search: 'range'},
                ]],
            });

            ea.listen();
        }
    };
});