define(["jquery", "easy-admin", "treetable", "iconPickerFa", "autocomplete"], function ($, ea) {

    var table = layui.table,
        treetable = layui.treetable,
        iconPickerFa = layui.iconPickerFa,
        autocomplete = layui.autocomplete,
        form = layui.form;

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        index_url: 'system.menu/index',
        add_url: 'system.menu/add',
        delete_url: 'system.menu/delete',
        edit_url: 'system.menu/edit',
        modify_url: 'system.menu/modify',
    };

    var Controller = {
        index: function () {

            var renderTable = function () {
                layer.load(0);
                treetable.render({
                    treeColIndex: 1,
                    treeSpid: 0,
                    homdPid: 99999999,
                    treeIdName: 'id',
                    treePidName: 'pid',
                    url: ea.url(init.index_url),
                    elem: init.table_elem,
                    id: init.table_render_id,
                    toolbar: '#toolbar',
                    defaultToolbar: ['filter', 'print', {
                        title: '搜索',
                        layEvent: 'TABLE_SEARCH',
                        icon: 'layui-icon-search',
                        extend: 'data-table-id="' + init.table_render_id + '"'
                    }],
                    page: false,
                    skin: 'line',

                    // @todo 不直接使用ea.table.render(); 进行表格初始化, 需要使用 ea.table.formatCols(); 方法格式化`cols`列数据
                    cols: ea.table.formatCols([[
                        {type: 'checkbox'},
                        {field: 'title', width: 250, title: '菜单名称', align: 'left'},
                        {
                            field: 'is_home',
                            width: 80,
                            title: '类型',
                            templet: function (d) {
                                if (d.pid === 99999999) {
                                    return '<span class="layui-badge layui-bg-blue">首页</span>';
                                }
                                if (d.pid === 0) {
                                    return '<span class="layui-badge layui-bg-gray">模块</span>';
                                } else {
                                    return '<span class="layui-badge-rim">菜单</span>';
                                }
                            }
                        },
                        {field: 'icon', width: 80, title: '图标', templet: ea.table.icon},
                        {field: 'href', minWidth: 120, title: '菜单链接', align: 'left'},
                        {field: 'status', title: '状态', width: 85, templet: ea.table.switch},
                        {field: 'sort', width: 80, title: '排序', edit: 'text'},
                        {
                            width: 200,
                            title: '操作',
                            templet: ea.table.tool,
                            operat: [
                                [{
                                    text: '添加下级',
                                    url: init.add_url,
                                    method: 'open',
                                    auth: 'add',
                                    class: 'layui-btn layui-btn-xs layui-btn-normal',
                                    render: function (d) {
                                        return d.pid != $variables.homePid;
                                    }
                                }, {
                                    text: '编辑',
                                    url: init.edit_url,
                                    method: 'open',
                                    auth: 'edit',
                                    class: 'layui-btn layui-btn-xs layuimini-btn-success',
                                }, {
                                    class: 'layui-btn layuimini-btn-danger layui-btn-xs',
                                    method: 'open',
                                    field: 'id',
                                    text: '删除',
                                    title: '确定删除？',
                                    auth: 'delete',
                                    url: init.delete_url,
                                    extend: 'data-treetable-delete-row',
                                    render: function (d, o) {
                                        if (d.pid == $variables.homePid) {
                                            return;
                                        }
                                        var delOperat = o.operat[0][2];
                                        return '<a class="' + delOperat.class + '" data-url="' + delOperat.url + '" data-title="' + delOperat.title + '" ' + delOperat.extend + '>' + delOperat.text + '</a>';
                                    }
                                }]
                            ]
                        }
                    ]], init),
                    done: function () {
                        layer.closeAll('loading');
                        ea.table.autoHeight(init.table_render_id);
                        ea.table.fixbar();
                    }
                });
            };

            renderTable();
            ea.table.listenToolbar(init.table_render_id + '_LayFilter', init.table_render_id);

            $('body').on('click', '[data-treetable-expand]', function () { //展开
                treetable.expandAll(init.table_elem);
            }).on('click', '[data-treetable-fold]', function () { //合拢
                treetable.foldAll(init.table_elem);
            }).on('click', '[data-treetable-refresh]', function () { //刷新
                renderTable();
            }).on('click', '[data-treetable-delete]', function () { //多选删除
                var tableId = $(this).attr('data-treetable-delete'),
                    url = $(this).attr('data-url');
                tableId = tableId || init.table_render_id;
                url = url != undefined ? ea.url(url) : window.location.href;
                var checkStatus = table.checkStatus(tableId),
                    data = checkStatus.data;
                if (data.length <= 0) {
                    ea.msg.error('请勾选需要删除的数据');
                    return false;
                }
                var ids = [];
                $.each(data, function (i, v) {
                    ids.push(v.id);
                });
                ea.msg.confirm('确定删除？', function () {
                    ea.request.post({
                        url: url,
                        data: {
                            id: ids
                        },
                    }, function (res) {
                        ea.msg.success(res.msg, function () {
                            renderTable();
                        });
                    });
                });
                return false;
            }).on('click', '[data-treetable-delete-row]', function () { //单行删除
                var title = $(this).attr('data-title'),
                    url = $(this).attr('data-url');
                url = url != undefined ? ea.url(url) : window.location.href;
                ea.msg.confirm(title, function () {
                    ea.request.post({
                        url: url
                    }, function (res) {
                        ea.msg.success(res.msg, function () {
                            renderTable();
                        });
                    })
                });
            }).on('click', '[data-treetable-reset]', function () {
                treetable.reset(init.table_elem);
            });

            //监听switch
            form.on('switch(status)', function (obj) {
                ea.request.post({
                    url: init.modify_url,
                    prefix: true,
                    data: {
                        id: obj.value,
                        field: obj.elem.name,
                        value: obj.elem.checked ? 1 : 0,
                    },
                }, function (res) {
                    // renderTable();
                }, function (res) {
                    ea.msg.error(res.msg, function () {
                        renderTable();
                    });
                }, function () {
                    renderTable();
                });
            });

            //监听编辑
            table.on('edit(currentTable)', function (obj) {
                ea.request.post({
                    url: init.modify_url,
                    prefix: true,
                    data: {
                        id: obj.data.id,
                        field: obj.field,
                        value: obj.value,
                    },
                }, function (res) {
                    renderTable();
                }, function (res) {
                    ea.msg.error(res.msg, function () {
                        renderTable();
                    });
                }, function () {
                    renderTable();
                });
            });

            form.on("submit(*)", function (data) {
                treetable.search(init.table_elem, data.field.keyword);
                return false;
            });

            ea.listen();
        },
        add: function () {
            iconPickerFa.render({
                elem: '#icon',
                url: PATH_CONFIG.iconLess,
                limit: 12,
                click: function (data) {
                    $('#icon').val('fa ' + data.icon);
                },
                success: function (d) {
                    console.log(d);
                }
            });
            autocomplete.render({
                elem: $('#href')[0],
                url: ea.url('system.menu/getMenuTips'),
                template_val: '{{d.node}}',
                template_txt: '{{d.node}} <span class=\'layui-badge layui-bg-gray\'>{{d.title}}</span>',
                onselect: function (resp) {
                }
            });

            ea.listen(function (data) {
                return data;
            }, function (res) {
                ea.msg.success(res.msg, function () {
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    parent.$('[data-treetable-refresh]').trigger("click");
                });
            });
        },
        edit: function () {
            iconPickerFa.render({
                elem: '#icon',
                url: PATH_CONFIG.iconLess,
                limit: 12,
                click: function (data) {
                    $('#icon').val('fa ' + data.icon);
                },
                success: function (d) {
                    console.log(d);
                }
            });
            autocomplete.render({
                elem: $('#href')[0],
                url: ea.url('system.menu/getMenuTips'),
                template_val: '{{d.node}}',
                template_txt: '{{d.node}} <span class=\'layui-badge layui-bg-gray\'>{{d.title}}</span>',
                onselect: function (resp) {
                }
            });

            ea.listen(function (data) {
                return data;
            }, function (res) {
                ea.msg.success(res.msg, function () {
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                    parent.$('[data-treetable-refresh]').trigger("click");
                });
            });
        }
    };
    return Controller;
});
