define(["jquery", "miniTab", "xmSelect", "sortable", "ckeditor", "tableSelect", "button"], function ($, miniTab, xmSelect, Sortable) {

    var form = layui.form,
        layer = layui.layer,
        table = layui.table,
        laydate = layui.laydate,
        upload = layui.upload,
        laytpl = layui.laytpl,
        util = layui.util,
        flow = layui.flow,
        button = layui.button,
        tableSelect = layui.tableSelect;

    var init = {
        table_elem: '#currentTable',
        table_render_id: 'currentTableRenderId',
        upload_url: 'ajax/upload',
        upload_exts: 'doc|docx|ppt|pptx|xls|xlsx|pdf|zip|rar|txt|ico|icon|gif|jpg|jpeg|png|mp3|mp4|p12|pem'
    };

    var admin = {
        config: {
            shade: [0.02, '#000'],
        },
        fileExt: function (filename) {
            return filename.split('.').pop().toLowerCase();
        },
        isImage(filename) {
            return ['bmp', 'ico', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'tiff', 'webp'].includes(admin.fileExt(filename));
        },
        uploadIcon: function (ext, toUrl = true) {
            var icon = '';
            if (ext.indexOf('.') !== -1) {
                ext = admin.fileExt(ext)
            }
            switch (ext) {
                case 'doc':
                case 'docx':
                    icon = 'doc.png';
                    break;
                case 'ico':
                case 'gif':
                case 'jpeg':
                case 'jpg':
                case 'png':
                    icon = 'image.png';
                    break;
                case 'mp3':
                    icon = 'mp3.png';
                    break;
                case 'mp4':
                    icon = 'mp4.png';
                    break;
                case 'pdf':
                    icon = 'pdf.png';
                    break;
                case 'ppt':
                case 'pptx':
                    icon = 'ppt.png';
                    break;
                case 'rar':
                    icon = 'rar.png';
                    break;
                case 'zip':
                    icon = 'zip.png';
                    break;
                case 'txt':
                    icon = 'txt.png';
                    break;
                case 'vsd':
                    icon = 'visio.png';
                    break;
                case 'xls':
                case 'xlsx':
                    icon = 'xls.png';
                    break;
                default:
                    icon = 'file.png';
            }
            return toUrl ? admin.imageUrl('upload-icons/' + icon) : icon;
        },
        imageUrl(filename = '') {
            return BASE_URL + 'admin/images/' + filename;
        },
        url: function (url) {
            return '/' + CONFIG.ADMIN + '/' + url;
        },
        headers: function () {
            return {'X-CSRF-TOKEN': admin.csrfToken()};
        },
        csrfToken: function (val) {
            if (val === undefined) {
                return window.top.CONFIG.CSRF_TOKEN;
            } else {
                window.top.CONFIG.CSRF_TOKEN = val;
            }
        },
        //js版empty，判断变量是否为空
        empty: function (r) {
            var n, t, e, f = [void 0, null, !1, 0, "", "0"];
            for (t = 0, e = f.length; t < e; t++) if (r === f[t]) return !0;
            if ("object" == typeof r) {
                for (n in r) if (r.hasOwnProperty(n)) return !1;
                return !0
            }
            return !1
        },
        checkAuth: function (node, elem) {
            if (CONFIG.IS_SUPER_ADMIN) {
                return true;
            }
            return $(elem).attr('data-auth-' + node) === '1';
        },
        parame: function (param, defaultParam) {
            return param !== undefined ? param : defaultParam;
        },
        request: {
            post: function (option, ok, no, ex, co) {
                option.headers = admin.headers();
                return admin.request.ajax('post', option, ok, no, ex, co);
            },
            get: function (option, ok, no, ex, co) {
                return admin.request.ajax('get', option, ok, no, ex, co);
            },
            ajax: function (type, option, ok, no, ex, co) {
                type = type || 'get';
                option.url = option.url || '';
                option.data = option.data || {};
                option.prefix = option.prefix || false;
                option.statusName = option.statusName || 'code';
                option.statusCode = option.statusCode || 0;
                option.loading = option.loading !== false;
                option.headers = option.headers || {};
                ok = ok || function (res) {
                };
                no = no || function (res) {
                    var msg = res.msg == undefined ? '返回数据格式有误' : res.msg;
                    admin.msg.error(msg);
                    return false;
                };
                ex = ex || function (res) {
                };
                co = co || function (xhr, status) {
                };
                if (option.url == '') {
                    admin.msg.error('请求地址不能为空');
                    return false;
                }
                if (option.prefix == true) {
                    option.url = admin.url(option.url);
                }
                if (option.loading === true) {
                    var index = admin.msg.loading('加载中');
                }
                $.ajax({
                    url: option.url,
                    type: type,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    dataType: "json",
                    headers: option.headers,
                    data: option.data,
                    timeout: 60000,
                    success: function (res) {
                        typeof index !== "undefined" && admin.msg.close(index);
                        if (eval('res.' + option.statusName) == option.statusCode) {
                            return ok(res);
                        } else {
                            return no(res);
                        }
                    },
                    error: function (xhr, textstatus, thrown) {
                        admin.msg.error('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！', function () {
                            ex(this);
                        });
                        return false;
                    },
                    complete: function (xhr, status) {
                        co(xhr, status);
                        // 刷新csrf-token
                        var csrfToken = xhr.getResponseHeader('X-CSRF-TOKEN');
                        if (csrfToken !== null) {
                            admin.csrfToken(csrfToken);
                        }
                    }
                });
            }
        },
        common: {
            parseNodeStr: function (node) {
                var array = node.split('/');
                $.each(array, function (key, val) {
                    if (key === 0) {
                        val = val.split('.');
                        $.each(val, function (i, v) {
                            val[i] = admin.common.humpToLine(v.replace(v[0], v[0].toLowerCase()));
                        });
                        val = val.join(".");
                        array[key] = val;
                    }
                });
                node = array.join("/");
                return node;
            },
            lineToHump: function (name) {
                return name.replace(/\_(\w)/g, function (all, letter) {
                    return letter.toUpperCase();
                });
            },
            humpToLine: function (name) {
                return name.replace(/([A-Z])/g, "_$1").toLowerCase();
            },
        },
        msg: {
            // 成功消息
            success: function (msg, callback) {
                callback = callback || function () {
                };
                return layer.msg(msg, {icon: 1, shade: admin.config.shade, scrollbar: false, time: 800, shadeClose: true}, callback);
            },
            // 失败消息
            error: function (msg, callback) {
                callback = callback || function () {
                };
                return layer.msg(msg, {icon: 2, shade: admin.config.shade, scrollbar: false, time: 3000, shadeClose: true}, callback);
            },
            // 警告消息框
            alert: function (msg, callback) {
                return layer.alert(msg, {end: callback, scrollbar: false});
            },
            // 对话框
            confirm: function (msg, ok, no) {
                var index = layer.confirm(msg, {title: '操作确认', btn: ['确认', '取消']}, function () {
                    typeof ok === 'function' && ok.call(this);
                }, function () {
                    typeof no === 'function' && no.call(this);
                    layer.close(index);
                });
                return index;
            },
            // 消息提示
            tips: function (msg, time, callback) {
                callback = callback || function () {
                };
                time = (time !== undefined ? time : 3) * 1000;
                return layer.msg(msg, {time: time, shade: admin.config.shade, end: callback, shadeClose: true});
            },
            // 加载中提示
            loading: function (msg, callback) {
                callback = callback || function () {
                };
                return msg ? layer.msg(msg, {icon: 16, scrollbar: false, shade: admin.config.shade, time: 0, end: callback}) : layer.load(2, {
                    time: 0,
                    scrollbar: false,
                    shade: admin.config.shade,
                    end: callback
                });
            },
            // 关闭消息框
            close: function (index) {
                return layer.close(index);
            }
        },
        table: {
            render: function (options) {
                options.init = options.init || init;
                options.init.align = options.align || 'center';
                options.init.form_full_screen = options.formFullScreen === true ? 'true' : 'false';
                options.modifyReload = admin.parame(options.modifyReload, true);
                options.search = admin.parame(options.search, true);
                options.topBar = admin.parame(options.topBar, false);
                options.elem = options.elem || options.init.table_elem;
                options.id = options.id || options.init.table_render_id;
                options.layFilter = options.id + '_LayFilter';
                options.url = options.url || admin.url(options.init.index_url);
                options.page = admin.parame(options.page, true);
                options.skin = options.skin || 'line';
                options.limit = options.limit || 15;
                options.limits = options.limits || [10, 15, 20, 25, 50, 100];
                options.cols = options.cols || [];
                options.cellExpandedMode = options.cellExpandedMode || 'tips';
                options.defaultToolbar = options.defaultToolbar || ['filter', 'print'];
                // 搜索按钮
                if (options.search) {
                    options.defaultToolbar.push({
                        title: '搜索',
                        layEvent: 'TABLE_SEARCH',
                        icon: 'layui-icon-search',
                        extend: 'data-table-id="' + options.id + '"'
                    });
                }
                // 移动端参数适配
                if (admin.checkMobile()) {
                    // 去除打印工具栏
                    var printIndex = options.defaultToolbar.indexOf('print');
                    if (printIndex !== -1) {
                        options.defaultToolbar.splice(printIndex, 1)
                    }
                    // 分页参数精简
                    if (options.page !== false) {
                        options.page = {
                            layout: ['first', 'prev', 'page', 'next', 'last', 'count']
                        };
                    }
                    // 返回顶部
                    options.topBar = true;
                }

                // 判断元素对象是否有嵌套的
                options.cols = admin.table.formatCols(options.cols, options.init);

                // 初始化表格lay-filter
                $(options.elem).attr('lay-filter', options.layFilter);

                // 初始化表格搜索
                if (options.search === true) {
                    options.where = admin.table.renderSearch(options.cols, options.elem, options.id);
                }

                // 初始化表格左上方工具栏
                options.toolbar = options.toolbar || ['refresh', 'add', 'delete', 'export'];
                options.toolbar = admin.table.renderToolbar(options.toolbar, options.elem, options.id, options.init);

                // 判断是否有操作列表权限
                options.cols = admin.table.renderOperat(options.cols, options.elem);

                //数据渲染完毕回调
                var optionDone = options.done;
                options.done = function (res, curr, count) {
                    typeof optionDone === 'function' && optionDone(res, curr, count);
                    // 解决非默认高度时，固定列行错位问题
                    admin.table.autoHeight(options.id);
                    // 表格转卡片
                    document.body.clientWidth < 768 && admin.table.table2card(options.id);
                    // 顶部返回
                    options.topBar && admin.table.fixbar();
                    // 页面中lay-src的img元素开启懒加载
                    options.init.lazyimg && flow.lazyimg();
                };

                // 初始化表格
                var newTable = table.render(options);

                // 监听表格搜索开关显示
                admin.table.listenToolbar(options.layFilter, options.id);

                // 监听表格开关切换
                admin.table.renderSwitch(options.cols, options.init, options.id, options.modifyReload);

                // 监听表格开关切换
                admin.table.listenEdit(options.init, options.layFilter, options.id, options.modifyReload);

                // 监听页面大小变化
                $(window).on('resize', function () {
                    admin.table.table2card(options.id);
                    admin.table.fixbar();
                });

                return newTable;
            },
            renderToolbar: function (data, elem, tableId, init) {
                data = data || [];
                var toolbarHtml = '';
                $.each(data, function (i, v) {
                    if (v === 'refresh') {
                        toolbarHtml += ' <button class="layui-btn layui-btn-sm layuimini-btn-primary" data-table-refresh="' + tableId + '"><i class="fa fa-refresh"></i> </button>\n';
                    } else if (v === 'add') {
                        if (admin.checkAuth('add', elem)) {
                            toolbarHtml += '<button class="layui-btn layui-btn-normal layui-btn-sm" data-open="' + init.add_url + '" data-title="添加" data-full="' + init.form_full_screen + '"><i class="fa fa-plus"></i> 添加</button>\n';
                        }
                    } else if (v === 'delete') {
                        if (admin.checkAuth('delete', elem)) {
                            toolbarHtml += '<button class="layui-btn layui-btn-sm layuimini-btn-danger" data-url="' + init.delete_url + '" data-table-delete="' + tableId + '"><i class="fa fa-trash-o"></i> 删除</button>\n';
                        }
                    } else if (v === 'export') {
                        if (admin.checkAuth('export', elem)) {
                            toolbarHtml += '<button class="layui-btn layui-btn-sm layuimini-btn-success easyadmin-export-btn" data-url="' + init.export_url + '" data-table-export="' + tableId + '"><i class="fa fa-file-excel-o"></i> 导出</button>\n';
                        }
                    } else if (typeof v === "object") {
                        $.each(v, function (ii, vv) {
                            vv.class = vv.class || '';
                            vv.icon = vv.icon || '';
                            vv.auth = vv.auth || '';
                            vv.url = vv.url || '';
                            vv.method = vv.method || 'open';
                            vv.title = vv.title || vv.text;
                            vv.text = vv.text || vv.title;
                            vv.extend = vv.extend || '';
                            vv.checkbox = vv.checkbox || false;
                            if (admin.checkAuth(vv.auth, elem)) {
                                toolbarHtml += admin.table.buildToolbarHtml(vv, tableId);
                            }
                        });
                    }
                });
                return '<div>' + toolbarHtml + '</div>';
            },
            renderSearch: function (cols, elem, tableId) {
                // TODO 只初始化第一个table搜索字段，如果存在多个(绝少数需求)，得自己去扩展
                cols = cols[0] || {};
                var newCols = [];
                var formHtml = '';
                var formatFilter = {};
                var formatOp = {};
                $.each(cols, function (i, d) {
                    d.field = d.field || false;
                    d.fieldAlias = admin.parame(d.fieldAlias, d.field);
                    d.title = d.title || d.field || '';
                    d.selectList = d.selectList || {};
                    d.search = admin.parame(d.search, true);
                    d.searchTip = d.searchTip || '请输入' + d.title || '';
                    d.searchValue = d.searchValue || '';
                    d.searchOp = d.searchOp || '%*%';
                    d.timeType = d.timeType || 'datetime';
                    if (d.field !== false && d.search !== false) {
                        switch (d.search) {
                            case true:
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '" data-search-op="' + d.searchOp + '" value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input" lay-affix="clear" lay-filter="' + d.fieldAlias + '" autocomplete="off">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case  'select':
                                d.searchOp = '=';
                                var selectHtml = '';
                                $.each(d.selectList, function (sI, sV) {
                                    var selected = '';
                                    if (sI === d.searchValue) {
                                        selected = 'selected=""';
                                    }
                                    selectHtml += '<option value="' + sI + '" ' + selected + '>' + sV + '</option>/n';
                                });
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<select class="layui-select" ' + (d.laySearch ? 'lay-search' : '') + ' id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '" >\n' +
                                    '<option value="">- 全部 -</option> \n' +
                                    selectHtml +
                                    '</select>\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case 'xmSelect':
                                d.searchOp = 'in';
                                var selectHtml = '';
                                var selectedArr = String(d.searchValue).split(',');
                                $.each(d.selectList, function (sI, sV) {
                                    var selected = '';
                                    if (selectedArr.includes(sI)) {
                                        selected = 'selected=""';
                                    }
                                    selectHtml += '<option value="' + sI + '" ' + selected + '>' + sV + '</option>/n';
                                });
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<select class="layui-select" ' + (d.laySearch ? 'xm-select-filterable' : '') + ' id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '" multiple lay-ignore xm-select xm-select-size="small">\n' +
                                    selectHtml +
                                    '</select>\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case 'range':
                                d.searchOp = 'range';
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '"  value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input" readonly autocomplete="off">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                            case 'time':
                                d.searchOp = '=';
                                formHtml += '\t<div class="layui-form-item layui-inline">\n' +
                                    '<label class="layui-form-label">' + d.title + '</label>\n' +
                                    '<div class="layui-input-inline">\n' +
                                    '<input id="c-' + d.fieldAlias + '" name="' + d.fieldAlias + '"  data-search-op="' + d.searchOp + '"  value="' + d.searchValue + '" placeholder="' + d.searchTip + '" class="layui-input" readonly autocomplete="off">\n' +
                                    '</div>\n' +
                                    '</div>';
                                break;
                        }
                        newCols.push(d);
                    }
                });
                if (formHtml !== '') {

                    $(elem).before('<fieldset id="searchFieldset_' + tableId + '" class="table-search-fieldset layui-hide">\n' +
                        '<legend>条件搜索</legend>\n' +
                        '<form class="layui-form layui-form-pane form-search" lay-filter="' + tableId + '">\n' +
                        formHtml +
                        '<div class="layui-form-item layui-inline" style="margin-left: 115px">\n' +
                        '<button type="submit" class="layui-btn layui-btn-normal" data-type="tableSearch" data-table="' + tableId + '" lay-submit lay-filter="' + tableId + '_filter"> 搜 索</button>\n' +
                        '<button type="reset" class="layui-btn layui-btn-primary" data-table-reset="' + tableId + '"> 重 置 </button>\n' +
                        ' </div>' +
                        '</form>' +
                        '</fieldset>');
                    // 初始化form表单
                    form.render();
                    // 搜索项监听
                    $.each(newCols, function (ncI, ncV) {
                        if (ncV.search === 'range' || ncV.search === 'time') {
                            laydate.render({
                                range: ncV.search === 'range',
                                type: ncV.timeType,
                                elem: '[name="' + ncV.fieldAlias + '"]',
                                onClear: function (value, date, endDate) {
                                    var tableOptions = table.getOptions(tableId);
                                    if (tableOptions.where.filter !== undefined) {
                                        var filter = JSON.parse(tableOptions.where.filter);
                                        filter[ncV.fieldAlias] !== undefined && $('[data-table="' + tableId + '"]').trigger("click");
                                    }
                                }
                            });
                        } else if (ncV.search === true) {
                            form.on('input-affix(' + ncV.fieldAlias + ')', function (data) {
                                if (data.affix === 'clear') {
                                    var tableOptions = table.getOptions(tableId);
                                    if (tableOptions.where.filter !== undefined) {
                                        var filter = JSON.parse(tableOptions.where.filter);
                                        filter[data.elem.name] !== undefined && $('[data-table="' + tableId + '"]').trigger("click");
                                    }
                                }
                            });
                        }
                    });
                    // 初始搜索条件
                    $.each(form.val(tableId), function (key, val) {
                        if (val !== '') {
                            formatFilter[key] = val;
                            formatOp[key] = $('[id=\'c-' + key + '\']').attr('data-search-op') || '%*%';
                        }
                    });
                    // 监听搜索
                    admin.table.listenTableSearch(tableId);
                }

                return {
                    filter: JSON.stringify(formatFilter),
                    op: JSON.stringify(formatOp)
                }
            },
            renderSwitch: function (cols, tableInit, tableId, modifyReload) {
                tableInit.modify_url = tableInit.modify_url || false;
                cols = cols[0] || {};
                tableId = tableId || init.table_render_id;
                if (cols.length > 0) {
                    $.each(cols, function (i, v) {
                        v.filter = v.filter || false;
                        if (v.filter !== false && tableInit.modify_url !== false) {
                            admin.table.listenSwitch({filter: v.filter, url: tableInit.modify_url, tableId: tableId, modifyReload: modifyReload});
                        }
                    });
                }
            },
            renderOperat(data, elem) {
                for (dk in data) {
                    var col = data[dk];
                    var operat = col[col.length - 1].operat;
                    if (operat !== undefined) {
                        var check = false;
                        for (key in operat) {
                            var item = operat[key];
                            if (typeof item === 'string') {
                                if (admin.checkAuth(item, elem)) {
                                    check = true;
                                    break;
                                }
                            } else {
                                for (k in item) {
                                    var v = item[k];
                                    if (v.auth !== undefined && admin.checkAuth(v.auth, elem)) {
                                        check = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!check) {
                            data[dk].pop()
                        }
                    }
                }
                return data;
            },
            buildToolbarHtml: function (toolbar, tableId) {
                var html = '';
                toolbar.class = toolbar.class || '';
                toolbar.icon = toolbar.icon || '';
                toolbar.auth = toolbar.auth || '';
                toolbar.url = toolbar.url || '';
                toolbar.extend = toolbar.extend || '';
                toolbar.method = toolbar.method || 'open';
                toolbar.field = toolbar.field || 'id';
                toolbar.title = toolbar.title || toolbar.text;
                toolbar.text = toolbar.text || toolbar.title;
                toolbar.checkbox = toolbar.checkbox || false;

                var formatToolbar = toolbar;
                formatToolbar.icon = formatToolbar.icon !== '' ? '<i class="' + formatToolbar.icon + '"></i> ' : '';
                formatToolbar.class = formatToolbar.class !== '' ? 'class="' + formatToolbar.class + '" ' : '';
                if (toolbar.method === 'open') {
                    formatToolbar.method = 'data-open="' + formatToolbar.url + '" data-title="' + formatToolbar.title + '" ';
                } else if (toolbar.method === 'request') {
                    formatToolbar.method = 'data-request="' + formatToolbar.url + '" data-title="' + formatToolbar.title + '" ';
                } else if (toolbar.method === 'tab') {
                    formatToolbar.method = 'layuimini-content-href="' + formatToolbar.url + '" data-title="' + formatToolbar.title + '" ';
                } else { //none,常用于与extend配合，自定义监听按钮
                    formatToolbar.method = '';
                }
                formatToolbar.checkbox = toolbar.checkbox ? ' data-checkbox="true" ' : '';
                formatToolbar.tableId = tableId !== undefined ? ' data-table="' + tableId + '" ' : '';
                html = '<button ' + formatToolbar.class + formatToolbar.method + formatToolbar.extend + formatToolbar.checkbox + formatToolbar.tableId + '>' + formatToolbar.icon + formatToolbar.text + '</button>';

                return html;
            },
            buildOperatHtml: function (operat) {
                var html = '';
                operat.class = operat.class || '';
                operat.icon = operat.icon || '';
                operat.auth = operat.auth || '';
                operat.url = operat.url || '';
                operat.extend = operat.extend || '';
                operat.method = operat.method || 'open';
                operat.field = operat.field || 'id';
                operat.title = operat.title || operat.text;
                operat.text = operat.text || operat.title;

                var formatOperat = operat;
                formatOperat.icon = formatOperat.icon !== '' ? '<i class="' + formatOperat.icon + '"></i> ' : '';
                formatOperat.class = formatOperat.class !== '' ? 'class="' + formatOperat.class + '" ' : '';
                if (operat.method === 'open') {
                    formatOperat.method = 'data-open="' + formatOperat.url + '" data-title="' + formatOperat.title + '" ';
                } else if (operat.method === 'request') {
                    formatOperat.method = 'data-request="' + formatOperat.url + '" data-title="' + formatOperat.title + '" ';
                } else if (operat.method === 'tab') {
                    formatOperat.method = 'layuimini-content-href="' + formatOperat.url + '" data-title="' + formatOperat.title + '" ';
                } else { //none,常用于与extend配合，自定义监听按钮
                    formatOperat.method = '';
                }
                html = '<a ' + formatOperat.class + formatOperat.method + formatOperat.extend + '>' + formatOperat.icon + formatOperat.text + '</a>';

                return html;
            },
            toolSpliceUrl(url, field, data) {
                url = url.indexOf("?") !== -1 ? url + '&' + field + '=' + data[field] : url + '?' + field + '=' + data[field];
                return url;
            },
            formatCols: function (cols, init) {
                for (i in cols) {
                    var col = cols[i];
                    for (index in col) {
                        var val = col[index];

                        // 懒加载标识
                        if (val.templet === admin.table.lazyimg && init.lazyimg === undefined) {
                            init.lazyimg = true;
                        }

                        // 判断是否包含初始化数据
                        if (val.init === undefined) {
                            cols[i][index]['init'] = init;
                        }

                        // 格式化列操作栏
                        if (val.templet === admin.table.tool && val.operat === undefined) {
                            cols[i][index]['operat'] = ['edit', 'delete'];
                        }

                        // 判断是否包含开关组件
                        if (val.templet === admin.table.switch && val.filter === undefined) {
                            cols[i][index]['filter'] = val.field;
                        }

                        // 判断是否含有搜索下拉列表
                        if (val.selectList !== undefined && val.search === undefined) {
                            cols[i][index]['search'] = 'select';
                        }

                        // 判断是否初始化对齐方式
                        if (val.align === undefined) {
                            cols[i][index]['align'] = init.align !== undefined ? init.align : 'center';
                        }

                        // 部分字段开启排序
                        var sortDefaultFields = ['id', 'sort'];
                        if (val.sort === undefined && sortDefaultFields.indexOf(val.field) >= 0) {
                            cols[i][index]['sort'] = true;
                        }

                        // 初始化图片高度
                        if (val.templet === admin.table.image && val.imageHeight === undefined) {
                            cols[i][index]['imageHeight'] = 40;
                        }

                        // 判断是否多层对象
                        if (val.field !== undefined && val.field.split(".").length > 1) {
                            if (val.templet === undefined) {
                                cols[i][index]['templet'] = admin.table.value;
                            }
                        }

                        // 判断是否列表数据转换
                        if (val.selectList !== undefined && val.templet === undefined) {
                            cols[i][index]['templet'] = admin.table.list;
                        }

                    }
                }
                return cols;
            },
            autoHeight(id) {
                var domTable = $('[lay-id="' + id + '"]');
                domTable.find(".layui-table-main tr").each(function (index, val) {
                    $(".layui-table-fixed").each(function () {
                        $($(this).find(".layui-table-body tbody tr")[index]).height($(val).height());
                    });
                });
                domTable.find(".layui-table-header tr").each(function (index, val) {
                    $(".layui-table-fixed").each(function () {
                        $($(this).find(".layui-table-header thead tr")[index]).height($(val).height());
                    });
                });
            },
            table2card(id) {
                var domTable = $('.layuimini-table2card [lay-id="' + id + '"]');
                if (domTable.length > 0) {
                    // 防止浏览器大小变化导致重复执行
                    if (domTable.find('.data-item').length === 0) {
                        var colsHeader = [];
                        domTable.find('.layui-table-header').first().find('.layui-table-cell').each(function (index, cell) {
                            if ($(cell).hasClass('laytable-cell-checkbox')) {
                                colsHeader.push('选择');
                            } else {
                                colsHeader.push($(cell).find('span').first().text())
                            }
                        });
                        domTable.find('.layui-table-main').find('tr').each(function (index, domTr) {
                            $(domTr).find('td').each(function (indexTd, domTd) {
                                $('<div class="data-item">' + colsHeader[indexTd] + '</div>').insertBefore($(domTd).find('.layui-table-cell'))
                            });
                        });
                    }
                }
            },
            fixbar(bgcolor) {
                bgcolor = bgcolor || '#1e9fff';
                util.fixbar({bgcolor: bgcolor});
            },
            tool: function (data) {
                var option = this;
                option.operat = option.operat || ['edit', 'delete'];
                var elem = option.init.table_elem || init.table_elem;
                var html = '';
                $.each(option.operat, function (i, item) {
                    if (typeof item === 'string') {
                        switch (item) {
                            case 'edit':
                                var operat = {
                                    class: 'layui-btn layuimini-btn-success layui-btn-xs',
                                    method: 'open',
                                    field: 'id',
                                    icon: '',
                                    text: '编辑',
                                    title: '编辑信息',
                                    auth: 'edit',
                                    url: option.init.edit_url,
                                    extend: 'data-full="' + option.init.form_full_screen + '"'
                                };
                                operat.url = admin.table.toolSpliceUrl(operat.url, operat.field, data);
                                if (admin.checkAuth(operat.auth, elem)) {
                                    html += admin.table.buildOperatHtml(operat);
                                }
                                break;
                            case 'delete':
                                var operat = {
                                    class: 'layui-btn layuimini-btn-danger layui-btn-xs',
                                    method: 'request',
                                    field: 'id',
                                    icon: '',
                                    text: '删除',
                                    title: '确定删除？',
                                    auth: 'delete',
                                    url: option.init.delete_url,
                                    extend: ""
                                };
                                operat.url = admin.table.toolSpliceUrl(operat.url, operat.field, data);
                                if (admin.checkAuth(operat.auth, elem)) {
                                    html += admin.table.buildOperatHtml(operat);
                                }
                                break;
                        }

                    } else if (typeof item === 'object') {
                        $.each(item, function (i, operat) {
                            operat.class = operat.class || '';
                            operat.icon = operat.icon || '';
                            operat.auth = operat.auth || '';
                            operat.url = operat.url || '';
                            operat.method = operat.method || 'open';
                            operat.field = operat.field || 'id';
                            operat.fieldAlias = admin.parame(operat.fieldAlias, operat.field);
                            operat.title = operat.title || operat.text;
                            operat.text = operat.text || operat.title;
                            operat.extend = operat.extend || '';

                            // 自定义表格opreat按钮的弹窗标题风格，extra是表格里的欲加入标题中的字段
                            operat.extra = operat.extra || '';
                            if (operat.extra) {
                                switch (typeof operat.extra) {
                                    case 'string':
                                        if (data[operat.extra] !== undefined) {
                                            operat.title = data[operat.extra] + ' - ' + operat.title;
                                        } else if (operat.extra.includes('.')) {
                                            var extraArr = operat.extra.split('.');
                                            var extraData = JSON.parse(JSON.stringify(data));
                                            try {
                                                extraArr.forEach(function (item) {
                                                    extraData = extraData[item];
                                                })
                                                operat.title = extraData + ' - ' + operat.title;
                                            } catch (e) {
                                            }
                                        }
                                        break;
                                    case 'function':
                                        operat.title = operat.extra(data, operat);
                                        break;
                                }
                            }

                            if (data[operat.fieldAlias] === undefined) {
                                data[operat.fieldAlias] = data[operat.field];
                            }

                            operat.url = admin.table.toolSpliceUrl(operat.url, operat.fieldAlias, data);
                            if (admin.checkAuth(operat.auth, elem)) {
                                if (typeof operat.render === 'function') {
                                    var renderResult = operat.render(data, option);
                                    if (renderResult) {
                                        html += typeof renderResult === 'string' ? renderResult : admin.table.buildOperatHtml(operat);
                                    }
                                } else {
                                    html += admin.table.buildOperatHtml(operat);
                                }
                            }
                        });
                    }
                });
                return html;
            },
            list: function (data) {
                var option = this;
                option.selectList = option.selectList || {};
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                if (option.selectList[value] === undefined || option.selectList[value] === '' || option.selectList[value] === null) {
                    return value;
                } else {
                    return option.selectList[value];
                }
            },
            image: function (data) {
                var option = this;
                option.imageWidth = option.imageWidth || 200;
                option.imageHeight = option.imageHeight || 40;
                option.imageSplit = option.imageSplit || '|';
                option.imageJoin = option.imageJoin || '<br>';
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                if (value === undefined || value === null || value === "") {
                    return '';
                } else {
                    var values = value.split(option.imageSplit),
                        valuesHtml = [];
                    values.forEach((value, index) => {
                        valuesHtml.push('<img style="max-width: ' + option.imageWidth + 'px; max-height: ' + option.imageHeight + 'px;" src="' + (admin.isImage(value) ? value : admin.uploadIcon(value)) + '" data-image="' + option.title + '" onerror="this.src=\'' + admin.uploadIcon(value) + '\'">');
                    });
                    return valuesHtml.join(option.imageJoin);
                }
            },
            lazyimg: function (data) {
                var option = this;
                option.imageWidth = option.imageWidth || 200;
                option.imageHeight = option.imageHeight || 40;
                option.imageSplit = option.imageSplit || '|';
                option.imageJoin = option.imageJoin || '<br>';
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                if (value === undefined || value === null || value === "") {
                    return '';
                }
                var values = value.split(option.imageSplit),
                    valuesHtml = [];
                values.forEach((value, index) => {
                    valuesHtml.push('<img style="max-width: ' + option.imageWidth + 'px; max-height: ' + option.imageHeight + 'px;" src="' + admin.imageUrl('loading.gif') + '" lay-src="' + (admin.isImage(value) ? value : admin.uploadIcon(value)) + '" data-image="' + option.title + '">');
                });
                return valuesHtml.join(option.imageJoin);
            },
            url: function (data) {
                var option = this;
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                return '<a class="layuimini-table-url" href="' + value + '" target="_blank">' + value + '</a>';
            },
            switch: function (data) {
                var option = this;
                var field = option.field;
                option.filter = option.filter || option.field || null;
                option.checked = option.checked || 1;
                option.tips = option.tips || '开|关';
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                var checked = value === option.checked ? 'checked' : '';
                return laytpl('<input type="checkbox" name="' + option.field + '" value="' + data.id + '" lay-skin="switch" title="' + option.tips + '" lay-filter="' + option.filter + '" ' + checked + ' >').render(data);
            },
            price: function (data) {
                var option = this;
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                return '<span>￥' + value + '</span>';
            },
            percent: function (data) {
                var option = this;
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                return '<span>' + value + '%</span>';
            },
            icon: function (data) {
                var option = this;
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                return '<i class="' + value + '"></i>';
            },
            text: function (data) {
                var option = this;
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                return '<span class="line-limit-length">' + value + '</span>';
            },
            value: function (data) {
                var option = this;
                var field = option.field;
                try {
                    var value = eval("data." + field);
                } catch (e) {
                    var value = undefined;
                }
                return '<span>' + value + '</span>';
            },
            //时间戳转日期
            date: function (data) {
                var option = this;
                var field = option.field, value = '';
                try {
                    value = eval("data." + field);
                } catch (e) {
                }
                if (!admin.empty(value)) {
                    value = util.toDateString(value * 1000, option.format || 'yyyy-MM-dd HH:mm:ss');
                }
                return '<span>' + value + '</span>';
            },
            byte: function (data) {
                var option = this;
                var field = option.field;
                var value = 0;
                var unitArr = ["B", "KB", 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var index = 0;
                try {
                    value = eval("data." + field);
                    while (value / 1024 > 1) {
                        value /= 1024;
                        index++;
                        if (index >= unitArr.length - 1) {
                            break;
                        }
                    }
                } catch (e) {
                }
                return '<span>' + (String(value).indexOf('.') !== -1 ? value.toFixed(2) : value) + unitArr[index] + '</span>';
            },
            listenTableSearch: function (tableId) {
                form.on('submit(' + tableId + '_filter)', function (data) {
                    var dataField = data.field;
                    var formatFilter = {},
                        formatOp = {};
                    $.each(dataField, function (key, val) {
                        if (val !== '') {
                            formatFilter[key] = val;
                            var op = $('[id=\'c-' + key + '\']').attr('data-search-op');
                            op = op || '%*%';
                            formatOp[key] = op;
                        }
                    });
                    table.reload(tableId, {
                        page: {
                            curr: 1
                        }
                        , where: {
                            filter: JSON.stringify(formatFilter),
                            op: JSON.stringify(formatOp)
                        }
                    }, 'data');
                    return false;
                });
            },
            listenSwitch: function (option, ok) {
                option.filter = option.filter || '';
                option.url = option.url || '';
                option.field = option.field || option.filter || '';
                option.tableId = option.tableId || init.table_render_id;
                option.modifyReload = option.modifyReload || false;
                form.on('switch(' + option.filter + ')', function (obj) {
                    var checked = obj.elem.checked ? 1 : 0;
                    if (typeof ok === 'function') {
                        return ok({
                            id: obj.value,
                            checked: checked,
                        });
                    } else {
                        var data = {
                            id: obj.value,
                            field: option.field,
                            value: checked,
                        };
                        admin.request.post({
                            url: option.url,
                            prefix: true,
                            data: data,
                        }, function (res) {
                            if (option.modifyReload) {
                                table.reload(option.tableId);
                            }
                        }, function (res) {
                            admin.msg.error(res.msg, function () {
                                table.reload(option.tableId);
                            });
                        }, function () {
                            table.reload(option.tableId);
                        });
                    }
                });
            },
            listenToolbar: function (layFilter, tableId) {
                table.on('toolbar(' + layFilter + ')', function (obj) {

                    // 搜索表单的显示
                    switch (obj.event) {
                        case 'TABLE_SEARCH':
                            var searchFieldsetId = 'searchFieldset_' + tableId;
                            var _that = $("#" + searchFieldsetId);
                            if (_that.hasClass("layui-hide")) {
                                _that.removeClass('layui-hide');
                            } else {
                                _that.addClass('layui-hide');
                            }
                            break;
                    }
                });
            },
            listenEdit: function (tableInit, layFilter, tableId, modifyReload) {
                tableInit.modify_url = tableInit.modify_url || false;
                tableId = tableId || init.table_render_id;
                if (tableInit.modify_url !== false) {
                    table.on('edit(' + layFilter + ')', function (obj) {
                        var value = obj.value,
                            data = obj.data,
                            id = data.id,
                            field = obj.field;
                        var _data = {
                            id: id,
                            field: field,
                            value: value,
                        };
                        admin.request.post({
                            url: tableInit.modify_url,
                            prefix: true,
                            data: _data,
                        }, function (res) {
                            if (modifyReload) {
                                table.reload(tableId);
                            }
                        }, function (res) {
                            admin.msg.error(res.msg, function () {
                                table.reload(tableId);
                            });
                        }, function () {
                            table.reload(tableId);
                        });
                    });
                }
            },
        },
        checkMobile: function () {
            var userAgentInfo = navigator.userAgent;
            var mobileAgents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
            var mobile_flag = false;
            //根据userAgent判断是否是手机
            for (var v = 0; v < mobileAgents.length; v++) {
                if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
                    mobile_flag = true;
                    break;
                }
            }
            var screen_width = window.screen.width;
            var screen_height = window.screen.height;
            //根据屏幕分辨率判断是否是手机
            if (screen_width < 600 && screen_height < 800) {
                mobile_flag = true;
            }
            return mobile_flag;
        },
        open: function (title, url, width, height, isResize, shadeClose = false) {
            isResize = isResize === undefined ? true : isResize;
            var index = layer.open({
                title: title,
                type: 2,
                area: [width, height],
                content: url,
                maxmin: true,
                moveOut: true,
                shadeClose: shadeClose,
                success: function (layero, index) {
                    // var body = layer.getChildFrame('body', index);
                },
                end: function () {
                    index = null
                }
            });
            if (admin.checkMobile() || width === undefined || height === undefined) {
                layer.full(index);
            }
            if (isResize) {
                $(window).on("resize", function () {
                    index && layer.full(index);
                })
            }
        },
        listen: function (preposeCallback, ok, no, ex, co) {

            // 监听表单是否为必填项
            admin.api.formRequired();

            // 监听表单提交事件
            admin.api.formSubmit(preposeCallback, ok, no, ex, co);

            // 初始化图片显示以及监听上传事件
            admin.api.upload();

            // 监听富文本初始化
            admin.api.editor();

            // 监听下拉选择生成
            admin.api.select();

            // 监听时间控件生成
            admin.api.date();

            // 监听select多选生成
            admin.api.xmSelect();

            // 监听tab
            miniTab.listen();

            // 初始化layui表单
            form.render();

            // 表格修改
            $("body").on("mouseenter", ".table-edit-tips", function () {
                var openTips = layer.tips('点击行内容可以进行修改', $(this), {tips: [2, '#e74c3c'], time: 4000});
            });

            // 监听弹出层的打开
            $('body').on('click', '[data-open]', function () {

                var clienWidth = $(this).attr('data-width'),
                    clientHeight = $(this).attr('data-height'),
                    dataFull = $(this).attr('data-full'),
                    checkbox = $(this).attr('data-checkbox'),
                    url = $(this).attr('data-open'),
                    title = $(this).attr('data-title'),
                    external = $(this).attr('data-external') === 'true',
                    tableId = $(this).attr('data-table');

                if (checkbox === 'true') {
                    tableId = tableId || init.table_render_id;
                    var checkStatus = table.checkStatus(tableId),
                        data = checkStatus.data;
                    if (data.length <= 0) {
                        admin.msg.error('请勾选需要操作的数据');
                        return false;
                    }
                    var ids = [];
                    $.each(data, function (i, v) {
                        ids.push(v.id);
                    });
                    if (url.indexOf("?") === -1) {
                        url += '?id=' + ids.join(',');
                    } else {
                        url += '&id=' + ids.join(',');
                    }
                }

                if (clienWidth === undefined || clientHeight === undefined) {
                    var width = document.body.clientWidth,
                        height = document.body.clientHeight;
                    if (width >= 800 && height >= 600) {
                        clienWidth = '800px';
                        clientHeight = '600px';
                    } else {
                        clienWidth = '100%';
                        clientHeight = '100%';
                    }
                }
                if (dataFull === 'true') {
                    clienWidth = '100%';
                    clientHeight = '100%';
                }

                admin.open(
                    title,
                    external ? url : admin.url(url),
                    clienWidth,
                    clientHeight,
                );
            });

            // 放大图片
            $('body').on('click', '[data-image]', function () {
                var currentSrc = $(this).attr('src'),
                    start = 0,
                    data = [];

                $(this).parent().children('[data-image]').each(function (i, v) {
                    var title = $(this).attr('data-image'),
                        alt = $(this).attr('alt'),
                        src = $(this).attr('src');

                    data.push({
                        "alt": alt ? alt : title,
                        "pid": Math.random(),
                        "src": src,
                        "thumb": src
                    });

                    if (currentSrc === src) {
                        start = i;
                    }
                });

                var photos = {
                    "title": '',
                    "start": start,
                    "id": Math.random(),
                    "data": data
                };
                layer.photos({
                    photos: photos,
                    anim: 5
                });
                return false;
            });

            // 放大一组上传回显的图片
            $('body').on('click', '[data-upload-show]', function () {
                var doms = $(this).closest(".layuimini-upload-show").children("li"),  // 从当前元素向上找layuimini-upload-show找到第一个后停止, 再找其所有子元素li
                    currentSrc = $(this).attr('src'), // 被点击的图片地址
                    start = 0,
                    data = [];
                $.each(doms, function (key, value) {
                    var img = $(value).find('img'),
                        src = img.attr('src'),
                        alt = img.attr('alt');
                    data.push({
                        "alt": alt,
                        "pid": Math.random(),
                        "src": src,
                        "thumb": src
                    });
                    if (src === currentSrc) {
                        start = key;
                    }
                });
                var photos = {
                    "title": '',
                    "start": start,
                    "id": Math.random(),
                    "data": data,
                };
                layer.photos({
                    photos: photos,
                    anim: 5
                });
                return false;
            });


            // 监听动态表格刷新
            $('body').on('click', '[data-table-refresh]', function () {
                var tableId = $(this).attr('data-table-refresh');
                if (tableId === undefined || tableId === '' || tableId == null) {
                    tableId = init.table_render_id;
                }
                table.reload(tableId);
            });

            // 监听搜索表格重置
            $('body').on('click', '[data-table-reset]', function () {
                var tableId = $(this).attr('data-table-reset');
                if (tableId === undefined || tableId === '' || tableId == null) {
                    tableId = init.table_render_id;
                }
                table.reload(tableId, {
                    page: {
                        curr: 1
                    }
                    , where: {
                        filter: '{}',
                        op: '{}'
                    }
                }, 'data');
            });

            // 监听请求
            $('body').on('click', '[data-request]', function () {
                var title = $(this).attr('data-title'),
                    url = $(this).attr('data-request'),
                    tableId = $(this).attr('data-table'),
                    addons = $(this).attr('data-addons'),
                    checkbox = $(this).attr('data-checkbox'),
                    direct = $(this).attr('data-direct'),
                    field = $(this).attr('data-field') || 'id';

                title = title || '确定进行该操作？';

                if (direct === 'true') {
                    admin.msg.confirm(title, function () {
                        window.location.href = url;
                    });
                    return false;
                }

                var postData = {};
                if (checkbox === 'true') {
                    tableId = tableId || init.table_render_id;
                    var checkStatus = table.checkStatus(tableId),
                        data = checkStatus.data;
                    if (data.length <= 0) {
                        admin.msg.error('请勾选需要操作的数据');
                        return false;
                    }
                    var ids = [];
                    $.each(data, function (i, v) {
                        ids.push(v[field]);
                    });
                    postData[field] = ids;
                }

                if (addons !== true && addons !== 'true') {
                    url = admin.url(url);
                }
                tableId = tableId || init.table_render_id;
                admin.msg.confirm(title, function () {
                    admin.request.post({
                        url: url,
                        data: postData,
                    }, function (res) {
                        admin.msg.success(res.msg, function () {
                            table.reload(tableId);
                        });
                    })
                });
                return false;
            });

            // excel导出
            $('body').on('click', '[data-table-export]', function () {
                var tableId = $(this).attr('data-table-export') || init.table_render_id,
                    url = admin.url($(this).attr('data-url')),
                    formatFilter = {},
                    formatOp = {};
                $.each(form.val(tableId), function (key, val) {
                    if (val !== '') {
                        formatFilter[key] = val;
                        var op = $('[id=\'c-' + key + '\']').attr('data-search-op');
                        op = op || '%*%';
                        formatOp[key] = op;
                    }
                });
                var index = admin.msg.confirm('根据查询进行导出，确定导出？', function () {
                    window.location = url + (url.indexOf('?') !== -1 ? '&' : '?') + 'filter=' + JSON.stringify(formatFilter) + '&op=' + JSON.stringify(formatOp);
                    layer.close(index);
                });
            });

            // 数据表格多删除
            $('body').on('click', '[data-table-delete]', function () {
                var tableId = $(this).attr('data-table-delete'),
                    url = $(this).attr('data-url');
                tableId = tableId || init.table_render_id;
                url = url !== undefined ? admin.url(url) : window.location.href;
                var checkStatus = table.checkStatus(tableId),
                    data = checkStatus.data;
                if (data.length <= 0) {
                    admin.msg.error('请勾选需要删除的数据');
                    return false;
                }
                var ids = [];
                $.each(data, function (i, v) {
                    ids.push(v.id);
                });
                admin.msg.confirm('确定删除？', function () {
                    admin.request.post({
                        url: url,
                        data: {
                            id: ids
                        },
                    }, function (res) {
                        admin.msg.success(res.msg, function () {
                            table.reload(tableId);
                        });
                    });
                });
                return false;
            });

        },
        api: {
            form: function (url, data, ok, no, ex, co, refreshTable) {
                if (refreshTable === undefined) {
                    refreshTable = true;
                }
                ok = ok || function (res) {
                    res.msg = res.msg || '';
                    admin.msg.success(res.msg, function () {
                        admin.api.closeCurrentOpen({
                            refreshTable: refreshTable
                        });
                    });
                    return false;
                };
                admin.request.post({
                    url: url,
                    data: data,
                }, ok, no, ex, co);
                return false;
            },
            closeCurrentOpen: function (option) {
                option = option || {};
                option.refreshTable = option.refreshTable || false;
                option.refreshFrame = option.refreshFrame || false;
                if (option.refreshTable === true) {
                    option.refreshTable = init.table_render_id;
                }
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
                if (option.refreshTable !== false) {
                    parent.layui.table.reload(option.refreshTable);
                }
                if (option.refreshFrame) {
                    parent.location.reload();
                }
                return false;
            },
            refreshFrame: function () {
                parent.location.reload();
                return false;
            },
            refreshTable: function (tableName) {
                tableName = tableName || 'currentTable';
                table.reload(tableName);
            },
            formRequired: function () {
                var verifyList = document.querySelectorAll("[lay-verify]");
                if (verifyList.length > 0) {
                    $.each(verifyList, function (i, v) {
                        var verify = $(this).attr('lay-verify');

                        // todo 必填项处理
                        if (verify.includes('required')) {
                            var label = $(this).parent().prev();
                            if (label.is('label') && !label.hasClass('required')) {
                                label.addClass('required');
                            }
                            if ($(this).attr('lay-reqtext') === undefined && $(this).attr('placeholder') !== undefined) {
                                $(this).attr('lay-reqtext', $(this).attr('placeholder'));
                            }
                            if ($(this).attr('placeholder') === undefined && $(this).attr('lay-reqtext') !== undefined) {
                                $(this).attr('placeholder', $(this).attr('lay-reqtext'));
                            }
                        }

                    });
                }
            },
            formSubmit: function (preposeCallback, ok, no, ex, co) {
                var formList = document.querySelectorAll("[lay-submit]");

                // 表单提交自动处理
                if (formList.length > 0) {
                    $.each(formList, function (i, v) {
                        var filter = $(this).attr('lay-filter'),
                            type = $(this).attr('data-type'),
                            refresh = $(this).attr('data-refresh'),
                            loading = $(this).attr('data-loading'),
                            url = $(this).attr('lay-submit');
                        // 表格搜索不做自动提交
                        if (type !== 'tableSearch') {
                            // 判断是否需要刷新表格
                            refresh = refresh !== 'false';
                            // 是否需要按钮loading
                            loading = loading !== 'false';
                            // 自动添加layui事件过滤器
                            if (filter === undefined || filter === '') {
                                filter = 'save_form_' + (i + 1);
                                $(this).attr('lay-filter', filter);
                            }
                            if (url === undefined || url === '' || url === null) {
                                url = window.location.href;
                            } else {
                                url = admin.url(url);
                            }
                            form.on('submit(' + filter + ')', function (data) {
                                // 加载按钮
                                if (loading) {
                                    var loadingBtn = button.load({elem: data.elem});
                                    var originCo = co;
                                    co = function (xhr, status) {
                                        typeof originCo === 'function' && originCo(xhr, status);
                                        setTimeout(function () {
                                            loadingBtn.stop();
                                        }, 600);
                                    };
                                }

                                var dataField = data.field;

                                // 富文本数据处理
                                var editorList = document.querySelectorAll(".editor");
                                if (editorList.length > 0) {
                                    $.each(editorList, function (i, v) {
                                        var name = $(this).attr("name");
                                        dataField[name] = CKEDITOR.instances[name].getData();
                                    });
                                }

                                if (typeof preposeCallback === 'function') {
                                    dataField = preposeCallback(dataField);
                                }
                                admin.api.form(url, dataField, ok, no, ex, co, refresh);

                                return false;
                            });
                        }
                    });
                }

            },
            upload: function () {
                var uploadList = document.querySelectorAll("[data-upload]");
                var uploadSelectList = document.querySelectorAll("[data-upload-select]");

                if (uploadList.length > 0) {
                    $.each(uploadList, function (i, v) {
                        var uploadExts = $(this).attr('data-upload-exts'),
                            uploadName = $(this).attr('data-upload'),
                            uploadNumber = $(this).attr('data-upload-number') || 'one',
                            uploadSign = $(this).attr('data-upload-sign') || '|',
                            uploadAccept = $(this).attr('data-upload-accept') || 'file',
                            uploadAcceptMime = $(this).attr('data-upload-mimetype') || '',
                            elem = "input[name='" + uploadName + "']";

                        // 监听上传事件
                        upload.render({
                            elem: this,
                            url: admin.url(init.upload_url),
                            exts: uploadExts && uploadExts !== "*" ? uploadExts : init.upload_exts,
                            accept: uploadAccept,//指定允许上传时校验的文件类型
                            acceptMime: uploadAcceptMime,//规定打开文件选择框时，筛选出的文件类型
                            multiple: uploadNumber !== 'one',//是否多文件上传
                            before: function () {
                                layer.load();
                            },
                            done: function (res) {
                                layer.closeAll('loading');
                                if (res.code === 0) {
                                    var url = res.data.url;
                                    if (uploadNumber !== 'one') {
                                        var oldUrl = $(elem).val();
                                        if (oldUrl !== '') {
                                            url = oldUrl + uploadSign + url;
                                        }
                                    }
                                    $(elem).val(url);
                                    $(elem).trigger("input");
                                    admin.msg.success(res.msg);
                                } else {
                                    admin.msg.error(res.msg);
                                }
                                return false;
                            },
                            error: function () {
                                layer.closeAll('loading');
                            }
                        });

                        // 监听上传input值变化
                        $(elem).bind("input propertychange", function (event) {
                            var urlString = $(this).val(),
                                urlArray = urlString.split(uploadSign);

                            $('#bing-' + uploadName).remove();
                            if (urlString.length > 0) {
                                var parant = $(this).parent('div');
                                var liHtml = '';
                                $.each(urlArray, function (i, v) {
                                    liHtml += '<li data-id="' + i + '"><img src="' + (admin.isImage(v) ? v : admin.uploadIcon(v)) + '" data-upload-show onerror="this.src=\'' + admin.uploadIcon(v) + '\';this.onerror=null"><small class="uploads-delete-tip bg-red badge" data-upload-delete="' + uploadName + '" data-upload-url="' + v + '" data-upload-sign="' + uploadSign + '">×</small></li>\n';
                                });
                                parant.after($('<ul id="bing-' + uploadName + '" class="layui-input-block layuimini-upload-show">\n' + liHtml + '</ul>').hide().fadeIn());
                                // 多图时可拖拽排序
                                if (uploadNumber !== 'one') {
                                    var sortable = Sortable.create(document.getElementById('bing-' + uploadName), {
                                        animation: 800,
                                        onUpdate: function (evt) {
                                            var newUrlArray = [];
                                            $.each(sortable.toArray(), function (i, v) {
                                                newUrlArray.push(urlArray[v])
                                            });
                                            $(event.currentTarget).val(newUrlArray.join(uploadSign));
                                        }
                                    });
                                }
                            }

                        });

                        // 非空初始化图片显示
                        if ($(elem).val() !== '') {
                            $(elem).trigger("input");
                        }
                    });

                    // 监听上传文件的删除事件
                    $('body').on('click', '[data-upload-delete]', function () {
                        var uploadName = $(this).attr('data-upload-delete'),
                            deleteUrl = $(this).attr('data-upload-url'),
                            sign = $(this).attr('data-upload-sign');
                        var confirm = admin.msg.confirm('确定删除？', function () {
                            var elem = "input[name='" + uploadName + "']";
                            var currentUrl = $(elem).val();
                            var url = '';
                            if (currentUrl !== deleteUrl) {
                                url = currentUrl.search(deleteUrl) === 0 ? currentUrl.replace(deleteUrl + sign, '') : currentUrl.replace(sign + deleteUrl, '');
                                $(elem).val(url);
                                $(elem).trigger("input");
                            } else {
                                $(elem).val(url);
                                $('#bing-' + uploadName).remove();
                            }
                            admin.msg.close(confirm);
                        });
                        return false;
                    });
                }

                if (uploadSelectList.length > 0) {
                    $.each(uploadSelectList, function (i, v) {
                        var uploadName = $(this).attr('data-upload-select'),
                            uploadNumber = $(this).attr('data-upload-number') || 'one',
                            uploadSign = $(this).attr('data-upload-sign') || '|',
                            uploadExts = $(this).attr('data-upload-exts') || '*';

                        var selectCheck = uploadNumber === 'one' ? 'radio' : 'checkbox';
                        var elem = "input[name='" + uploadName + "']",
                            uploadElem = $(this).attr('id');

                        tableSelect.render({
                            elem: "#" + uploadElem,
                            checkedKey: 'id',
                            searchType: 'more',
                            searchList: [
                                {searchKey: 'title', searchPlaceholder: '请输入文件名'},
                            ],
                            table: {
                                url: admin.url('ajax/getUploadFiles') + (uploadExts !== '*' ? '?ext=' + uploadExts : ''),
                                cols: [[
                                    {type: selectCheck},
                                    {field: 'id', minWidth: 80, title: 'ID', align: "left"},
                                    {field: 'url', minWidth: 80, title: '文件预览', align: "left", templet: admin.table.lazyimg},
                                    {field: 'original_name', minWidth: 150, title: '文件原名', align: "left"},
                                    {field: 'mime_type', minWidth: 120, title: 'mime类型', align: "left"},
                                    {field: 'create_time', minWidth: 200, title: '创建时间', align: "left"},
                                ]],
                                limit: 15,
                                limits: [10, 15, 20, 25, 50, 100],
                                done: function (res, curr, count) {
                                    flow.lazyimg({
                                        elem: '.tableSelect .layui-table-body img[lay-src]',
                                        scrollElem: '.tableSelect .layui-table-body'
                                    });
                                }
                            },
                            done: function (e, data) {
                                var urlArray = [];
                                $.each(data.data, function (index, val) {
                                    urlArray.push(val.url)
                                });
                                var url = urlArray.join(uploadSign);
                                admin.msg.success('选择成功', function () {
                                    $(elem).val(url);
                                    $(elem).trigger("input");
                                });
                            }
                        })

                    });

                }
            },
            editor: function () {
                var editorList = document.querySelectorAll(".editor");
                if (editorList.length > 0) {
                    $.each(editorList, function (i, v) {
                        CKEDITOR.replace(
                            $(this).attr("name"),
                            {
                                height: $(this).height(),
                                filebrowserImageUploadUrl: admin.url('ajax/uploadEditor'),
                            });
                    });
                }
            },
            select: function () {
                var selectList = document.querySelectorAll("[data-select]");
                $.each(selectList, function (i, v) {
                    var url = $(this).attr('data-select'),
                        selectFields = $(this).attr('data-fields'),
                        value = $(this).attr('data-value'),
                        placeholder = $(this).attr('data-placeholder'),
                        that = this,
                        html = '<option value="">' + (placeholder ? placeholder : '') + '</option>';
                    var fields = selectFields.replace(/\s/g, "").split(',');
                    if (fields.length !== 2) {
                        return admin.msg.error('下拉选择字段有误');
                    }
                    admin.request.get(
                        {
                            url: url,
                            data: {
                                selectFields: selectFields
                            },
                        }, function (res) {
                            var list = res.data;
                            list.forEach(val => {
                                var key = val[fields[0]];
                                if (value !== undefined && key.toString() === value) {
                                    html += '<option value="' + key + '" selected="">' + val[fields[1]] + '</option>';
                                } else {
                                    html += '<option value="' + key + '">' + val[fields[1]] + '</option>';
                                }
                            });
                            $(that).html(html);
                            form.render();
                        }
                    );
                });
            },
            date: function () {
                var dateList = document.querySelectorAll("[data-date]");
                if (dateList.length > 0) {
                    $.each(dateList, function (i, v) {
                        var format = $(this).attr('data-date'),
                            type = $(this).attr('data-date-type'),
                            range = $(this).attr('data-date-range');
                        if (type === undefined || type === '' || type === null) {
                            type = 'datetime';
                        }
                        var options = {
                            elem: this,
                            type: type,
                        };
                        if (format !== undefined && format !== '' && format !== null) {
                            options['format'] = format;
                        }
                        if (range !== undefined) {
                            if (range === null || range === '') {
                                range = '-';
                            }
                            options['range'] = range;
                        }
                        laydate.render(options);
                    });
                }
            },
            xmSelect: function () {
                var selectList = document.querySelectorAll("select[xm-select]");
                if (selectList.length > 0) {
                    $.each(selectList, function (i, v) {
                        var name = $(v).attr('name') || 'select';
                        var layVerify = $(v).attr('xm-select-layVerify') || '';
                        var layVerType = $(v).attr('xm-select-layVerType') || '';
                        var layReqText = $(v).attr('xm-select-layReqText') || '';
                        var max = $(v).attr('xm-select-max') || 0;
                        var tips = $(v).attr('xm-select-tips') || '请选择';
                        var size = $(v).attr('xm-select-size') || 'medium';
                        var direction = $(v).attr('xm-select-direction') || 'auto';
                        var empty = $(v).attr('xm-select-empty') || '暂无数据';
                        var searchTips = $(v).attr('xm-select-searchTips') || '请选择';
                        var height = $(v).attr('xm-select-height') || '200px';
                        var themeColor = $(v).attr('xm-select-themeColor') || '#16b777';
                        var radio = $(v).attr('multiple') === undefined;
                        var filterable = $(v).attr('xm-select-filterable') !== undefined;
                        var toolbarShow = $(v).attr('xm-select-toolbar') !== undefined;
                        var autoRow = $(v).attr('xm-select-autoRow') !== undefined;
                        var repeat = $(v).attr('xm-select-repeat') !== undefined;
                        var clickClose = $(v).attr('xm-select-clickClose') !== undefined;
                        var initValue = [];
                        var data = [];
                        var options = $(v).find('option[value!=""]');
                        $.each(options, function (ii, vv) {
                            var value = $(vv).val();
                            var label = $(vv).text();
                            data.push({name: label, value: value});
                            $(vv).prop('selected') && initValue.push(value);
                        });

                        var id = $(v).attr('id');
                        if (id && id.indexOf('c-') !== -1) {
                            var searchOp = $(v).attr('data-search-op') || '%*%';
                            $(v).after('<div id="' + id + '" data-search-op="' + searchOp + '"></div>').remove();
                        } else {
                            $(v).after('<div id="c-' + name + '"></div>').remove();
                        }
                        xmSelect.render({
                            el: '#c-' + name,
                            data: data,
                            initValue: initValue,
                            tips: tips,
                            empty: empty,
                            filterable: filterable,
                            searchTips: searchTips,
                            direction: direction,
                            height: height,
                            radio: radio,
                            repeat: repeat,
                            clickClose: clickClose,
                            theme: {
                                color: themeColor
                            },
                            max: max,
                            name: name,
                            layVerify: layVerify,
                            layVerType: layVerType,
                            layReqText: layReqText,
                            toolbar: {
                                show: toolbarShow,
                                showIcon: true,
                                list: ['ALL', 'CLEAR', 'REVERSE']
                            },
                            autoRow: autoRow,
                            size: size,
                        });
                    });
                }
            }
        },
    };
    return admin;
});
