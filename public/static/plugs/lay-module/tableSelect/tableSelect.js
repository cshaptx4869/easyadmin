layui.define(['table', 'jquery', 'form'], function (exports) {
    "use strict";

    var MOD_NAME = 'tableSelect',
        $ = layui.jquery,
        table = layui.table,
        form = layui.form;
    var tableSelect = function () {
        this.v = '1.1.0';
    };

    /**
     * 初始化表格选择器
     */
    tableSelect.prototype.render = function (opt) {
        var elem = $(opt.elem);
        var tableDone = opt.table.done || function () {
        };
        //默认设置
        opt.searchKey = opt.searchKey || 'keyword';
        opt.searchPlaceholder = opt.searchPlaceholder || '关键词搜索';
        opt.checkedKey = opt.checkedKey || '';
        opt.table.page = opt.table.page || true;
        opt.table.height = opt.height || 315;
        //宽度
        opt.width = opt.width || '70%';
        //多搜索条件
        opt.searchType = opt.searchType || 'one';
        opt.searchList = opt.searchList || [{key: opt.searchKey, placeholder: opt.searchPlaceholder}];
        //监听点击
        elem.off('click').on('click', function (e) {
            e.stopPropagation();

            if ($('div.tableSelect').length >= 1) {
                return false;
            }

            var t = elem.offset().top + elem.outerHeight() + 6 + "px";
            var r = document.body.clientWidth - elem.offset().left - elem.outerWidth() + "px";
            var tableName = "tableSelect_table_" + new Date().getTime();
            var tableBox = '<div class="tableSelect layui-anim layui-anim-upbit" style="position: absolute;z-index:999;right: ' + r + ';top: ' + t + ';width: ' + opt.width + ';overflow: auto;border: 1px solid #d2d2d2;background-color: #fff;box-shadow: 0 2px 4px rgba(0,0,0,.12);padding:10px;margin-top: 5px 0;border-radius: 2px;">';
            tableBox += '<div class="tableSelectBar" style="margin-bottom: 10px;display: flex;justify-content: space-between;">';
            tableBox += '<form class="layui-form" action="" style="display:inline-block;">';

            //判断是否多搜索条件
            if (opt.searchType == 'more') {
                $.each(opt.searchList, function (index, item) {
                    tableBox += '<input style="display:inline-block;width:190px;height:30px;vertical-align:middle;margin-right:-1px;border: 1px solid #C9C9C9;" type="text" name="' + item.searchKey + '" placeholder="' + item.searchPlaceholder + '" autocomplete="off" class="layui-input">';
                });
            } else {
                tableBox += '<input style="display:inline-block;width:190px;height:30px;vertical-align:middle;margin-right:-1px;border: 1px solid #C9C9C9;" type="text" name="' + opt.searchKey + '" placeholder="' + opt.searchPlaceholder + '" autocomplete="off" class="layui-input">';
            }

            tableBox += '<button class="layui-btn layui-btn-sm layui-btn-primary tableSelect_btn_search" lay-submit lay-filter="tableSelect_btn_search"><i class="layui-icon layui-icon-search"></i></button>';
            tableBox += '</form>';
            tableBox += '<button class="layui-btn layui-btn-sm tableSelect_btn_select">选择<span></span></button>';
            tableBox += '</div>';
            tableBox += '<table id="' + tableName + '" lay-filter="' + tableName + '"></table>';
            tableBox += '</div>';
            tableBox = $(tableBox);
            $('body').append(tableBox);

            //数据缓存
            var checkedData = [];

            //渲染TABLE
            opt.table.elem = "#" + tableName;
            opt.table.id = tableName;
            opt.table.done = function (res, curr, count) {
                defaultChecked(res, curr, count);
                setChecked(res, curr, count);
                tableDone(res, curr, count);
            };
            var tableSelect_table = table.render(opt.table);

            //分页选中保存数组
            table.on('radio(' + tableName + ')', function (obj) {
                if (opt.checkedKey) {
                    checkedData = table.checkStatus(tableName).data
                }
                updataButton(table.checkStatus(tableName).data.length)
            })
            table.on('checkbox(' + tableName + ')', function (obj) {
                if (opt.checkedKey) {
                    if (obj.checked) {
                        for (var i = 0; i < table.checkStatus(tableName).data.length; i++) {
                            checkedData.push(table.checkStatus(tableName).data[i])
                        }
                    } else {
                        if (obj.type == 'all') {
                            for (var j = 0; j < table.cache[tableName].length; j++) {
                                for (var i = 0; i < checkedData.length; i++) {
                                    if (checkedData[i][opt.checkedKey] == table.cache[tableName][j][opt.checkedKey]) {
                                        checkedData.splice(i, 1)
                                    }
                                }
                            }
                        } else {
                            //因为LAYUI问题，操作到变化全选状态时获取到的obj为空，这里用函数获取未选中的项。
                            var nu = function () {
                                var noCheckedKey = '';
                                for (var i = 0; i < table.cache[tableName].length; i++) {
                                    if (!table.cache[tableName][i].LAY_CHECKED) {
                                        noCheckedKey = table.cache[tableName][i][opt.checkedKey];
                                    }
                                }
                                return noCheckedKey
                            };
                            var noCheckedKey = obj.data[opt.checkedKey] || nu();
                            for (var i = 0; i < checkedData.length; i++) {
                                if (checkedData[i][opt.checkedKey] == noCheckedKey) {
                                    checkedData.splice(i, 1);
                                }
                            }
                        }
                    }
                    checkedData = uniqueObjArray(checkedData, opt.checkedKey);
                    updataButton(checkedData.length)
                } else {
                    updataButton(table.checkStatus(tableName).data.length)
                }
            });

            //渲染表格后选中
            function setChecked(res, curr, count) {
                var tableDom = $('#' + tableName + '').next();
                for (var i = 0; i < res.data.length; i++) {
                    for (var j = 0; j < checkedData.length; j++) {
                        if (res.data[i][opt.checkedKey] == checkedData[j][opt.checkedKey]) {
                            res.data[i].LAY_CHECKED = true;
                            var index = res.data[i]['LAY_INDEX'];
                            tableDom.find('tr[data-index=' + index + ']').addClass('layui-table-checked');
                            var checkbox = tableDom.find('tr[data-index=' + index + '] input[type="checkbox"]');
                            checkbox.prop('checked', true).next().addClass('layui-form-checked');
                            var radio = tableDom.find('tr[data-index=' + index + '] input[type="radio"]');
                            radio.prop('checked', true).next().addClass('layui-form-radioed').find("i").removeClass('layui-icon-circle').addClass('layui-icon-radio');
                        }
                    }
                }
                var checkStatus = table.checkStatus(tableName);
                if (checkStatus.isAll) {
                    tableDom.find('.layui-table-header th[data-field="0"] input[type="checkbox"]').prop('checked', true);
                    tableDom.find('.layui-table-header th[data-field="0"] input[type="checkbox"]').next().addClass('layui-form-checked');
                }
                updataButton(checkedData.length)
            }

            //写入默认选中值(puash checkedData)
            function defaultChecked(res, curr, count) {
                if (opt.checkedKey && elem.attr('ts-selected')) {
                    var selected = elem.attr('ts-selected').split(",");
                    for (var i = 0; i < res.data.length; i++) {
                        for (var j = 0; j < selected.length; j++) {
                            if (res.data[i][opt.checkedKey] == selected[j]) {
                                checkedData.push(res.data[i])
                            }
                        }
                    }
                    checkedData = uniqueObjArray(checkedData, opt.checkedKey);
                }
            }

            //更新选中数量
            function updataButton(n) {
                tableBox.find('.tableSelect_btn_select span').html(n == 0 ? '' : '(' + n + ')')
            }

            //数组去重
            function uniqueObjArray(arr, type) {
                var newArr = [];
                var tArr = [];
                if (arr.length == 0) {
                    return arr;
                } else {
                    if (type) {
                        for (var i = 0; i < arr.length; i++) {
                            if (!tArr[arr[i][type]]) {
                                newArr.push(arr[i]);
                                tArr[arr[i][type]] = true;
                            }
                        }
                        return newArr;
                    } else {
                        for (var i = 0; i < arr.length; i++) {
                            if (!tArr[arr[i]]) {
                                newArr.push(arr[i]);
                                tArr[arr[i]] = true;
                            }
                        }
                        return newArr;
                    }
                }
            }

            //关键词搜索
            form.on('submit(tableSelect_btn_search)', function (data) {
                tableSelect_table.reload({
                    where: data.field,
                    page: {
                        curr: 1
                    }
                });
                return false;
            });

            //双击行选中
            table.on('rowDouble(' + tableName + ')', function (obj) {
                var checkStatus = {data: [obj.data]};
                selectDone(checkStatus);
            })

            //按钮选中
            tableBox.find('.tableSelect_btn_select').on('click', function () {
                var checkStatus = table.checkStatus(tableName);
                if (checkedData.length > 1) {
                    checkStatus.data = checkedData;
                }
                selectDone(checkStatus);
            })

            //写值回调和关闭
            function selectDone(checkStatus) {
                if (opt.checkedKey) {
                    var selected = [];
                    for (var i = 0; i < checkStatus.data.length; i++) {
                        selected.push(checkStatus.data[i][opt.checkedKey])
                    }
                    elem.attr("ts-selected", selected.join(","));
                }
                opt.done(elem, checkStatus);
                tableBox.remove();
                delete table.cache[tableName];
                checkedData = [];
            }

            //点击其他区域关闭
            $(document).mouseup(function (e) {
                var userSet_con = $('' + opt.elem + ',.tableSelect');
                if (!userSet_con.is(e.target) && userSet_con.has(e.target).length === 0) {
                    tableBox.remove();
                    delete table.cache[tableName];
                    checkedData = [];
                }
            });

            //重新定位
            $(window).on('resize', function () {
                var t = elem.offset().top + elem.outerHeight() + 6 + "px";
                var r = document.body.clientWidth - elem.offset().left - elem.outerWidth() + "px";
                tableBox.css({
                    top: t,
                    right: r
                });
            });
        })
    }

    /**
     * 隐藏选择器
     */
    tableSelect.prototype.hide = function (opt) {
        $('.tableSelect').remove();
    }

    exports(MOD_NAME, new tableSelect());
})