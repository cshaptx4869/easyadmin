define(["jquery", "easy-admin"], function ($, ea) {

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.crontab/index',
        add_url: 'system.crontab/add',
        delete_url: 'system.crontab/delete',
        modify_url: 'system.crontab/modify',
        flow_url: 'system.crontab/flow',
        reload_url: 'system.crontab/reload',
        ping_url: 'system.crontab/ping',
    };

    return {
        index: function () {
            var table = layui.table;

            function ping() {
                ea.request.get(
                    {
                        url: init.ping_url,
                        prefix: true
                    },
                    function (res) {
                        $('#crontab-status').html('定时任务 <span class="layui-badge layui-bg-green">运行中</span>');
                        table.reload(init.table_render_id);
                    },
                    function (res) {
                        $('#crontab-status').html('定时任务 <span class="layui-badge layui-bg-red">未启动</span> 请在项目根目录执行命令 <b>php think crontab start -d</b>');
                        table.reload(init.table_render_id);
                    }
                );
            }

            ping();
            setInterval(ping, 60000);

            ea.table.render({
                init: init,
                toolbar: ['refresh', 'delete', 'add'],
                cellMinWidth: 100,
                cols: [[
                    {type: 'checkbox'},
                    {field: 'id', title: 'ID', sort: true, width: 80, search: false},
                    {field: 'title', title: '任务标题', edit: "text"},
                    {field: 'type', title: '任务类型', selectList: {0: '请求url', 1: '执行sql', 2: '执行shell'}},
                    {field: 'frequency', title: '任务频率', edit: "text", search: false},
                    {field: 'shell', title: '任务脚本', edit: "text", search: false},
                    {field: 'remark', title: '任务备注', edit: "text", search: false},
                    {field: 'last_running_time', title: '任务上次执行时间', templet: ea.table.date, search: false},
                    {field: 'running_times', title: '任务已执行次数', search: false},
                    {field: 'sort', title: '排序', sort: true, edit: 'text', search: false},
                    {field: 'status', title: '状态', sort: true, templet: ea.table.switch, selectList: {0: '禁用', 1: '启用'}},
                    {field: 'create_time', title: '创建时间', sort: true, templet: ea.table.date, search: 'range'},
                    {
                        width: 150, title: '操作', templet: ea.table.tool, operat: [
                            [{
                                text: '重启',
                                url: init.reload_url,
                                field: 'id',
                                method: 'request',
                                title: '确定重启吗？',
                                auth: 'reload',
                                class: 'layui-btn layui-btn-xs layui-btn-success'
                            }, {
                                text: '日志',
                                url: init.flow_url,
                                field: 'id',
                                method: 'open',
                                auth: 'flow',
                                class: 'layui-btn layui-btn-xs layui-btn-normal',
                                extend: 'data-full="false"',
                            }],
                            'delete']
                    }
                ]],
            });

            ea.listen();
        },
        add: function () {
            ea.listen();
        },
        flow: function () {

            var intervalID,
                table = layui.table,
                form = layui.form,
                util = layui.util,
                init = {
                    table_elem: '#currentTable',
                    table_render_id: 'currentTableRenderId',
                    index_url: 'system.crontab/flow?sid=' + sid,
                };

            ea.table.render({
                init: init,
                toolbar: ['refresh'],
                cellMinWidth: 100,
                cols: [[
                    {field: 'id', title: 'ID', sort: true, width: 80, search: false},
                    {field: 'month', title: '日志月份', hide: true, search: 'time', timeType: 'month', searchValue: util.toDateString(new Date(), 'yyyy-MM')},
                    {
                        field: 'return_var', title: '运行结果', selectList: {0: '成功', 1: '失败'}, templet: function (d) {
                            return d.return_var === 0 ? '<span class="layui-badge layui-bg-green">成功</span>' : '<span class="layui-badge layui-bg-red">失败</span>';
                        }
                    },
                    {field: 'command', title: '任务命令', search: false},
                    {
                        field: 'running_time', title: '执行耗时', search: false, templet: function (d) {
                            return d.running_time + 's';
                        }
                    },
                    {
                        field: 'output', title: '执行输出', search: false, templet: function (d) {
                            return d.output.replace(/\n/g, "<br/>");
                        }
                    },
                    {field: 'create_time', title: '执行时间', sort: true, templet: ea.table.date, search: 'range'}
                ]],
            });

            form.on('switch(monitor)', function (data) {
                if (data.elem.checked) {
                    intervalID = setInterval(function () {
                        table.reload(init.table_render_id);
                    }, 1000);
                } else {
                    clearInterval(intervalID);
                }

            });

            ea.listen();
        }
    }
})
