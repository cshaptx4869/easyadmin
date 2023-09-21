var BASE_URL = document.scripts[document.scripts.length - 1].src.substring(0, document.scripts[document.scripts.length - 1].src.lastIndexOf("/") + 1);
// requireJS配置
require.config({
    urlArgs: "v=" + CONFIG.VERSION,
    baseUrl: BASE_URL,
    paths: {
        "vue": ["plugs/vue/vue.min"],
        "ckeditor": ["plugs/ckeditor/ckeditor"],
        "sortable": ["plugs/sortable/Sortable.min"],
        "echarts": ["plugs/echarts/echarts.min"],
        "echarts-theme": ["plugs/echarts/echarts-theme"],
        "easy-admin": ["plugs/easy-admin/easy-admin"],
        "jquery": ["plugs/jquery/jquery-3.4.1.min"],
        "jquery-particleground": ["plugs/jq-module/jquery.particleground.min"],
        "css": ["plugs/req-module/require-css/css.min"],
        "miniAdmin": ["plugs/req-module/layuimini/miniAdmin"],
        "miniMenu": ["plugs/req-module/layuimini/miniMenu"],
        "miniTab": ["plugs/req-module/layuimini/miniTab"],
        "miniTheme": ["plugs/req-module/layuimini/miniTheme"],
        "miniTongji": ["plugs/req-module/layuimini/miniTongji"],
        "autocomplete": ["plugs/lay-module/autocomplete/autocomplete"],
        "countTo": ["plugs/lay-module/countTo/countTo"],
        "iconPickerFa": ["plugs/lay-module/iconPicker/iconPickerFa"],
        "popover": ["plugs/lay-module/popover/popover"],
        "tableSelect": ["plugs/lay-module/tableSelect/tableSelect"],
        "treetable": ["plugs/lay-module/treetable-lay/treetable"],
        "xmSelect": ["plugs/lay-module/xmSelect/xm-select"],
    },
    shim: {
        "jquery-particleground": {
            deps: ["jquery"]
        },
        "autocomplete": {
            deps: ["css!plugs/lay-module/autocomplete/autocomplete.css"]
        },
        "popover": {
            deps: ["css!plugs/lay-module/popover/popover.min.css"]
        },
        "treetable": {
            deps: ["css!plugs/lay-module/treetable-lay/treetable.css"]
        }
    }
});

// 此处指向static目录
window.BASE_URL = BASE_URL;
// 路径配置信息
window.PATH_CONFIG = {
    iconLess: BASE_URL + "plugs/font-awesome/less/variables.less",
};

// 初始化控制器对应的JS自动加载
if ("undefined" != typeof CONFIG.AUTOLOAD_JS && CONFIG.AUTOLOAD_JS) {
    require([BASE_URL + CONFIG.CONTROLLER_JS_PATH], function (Controller) {
        if (eval('Controller.' + CONFIG.ACTION)) {
            eval('Controller.' + CONFIG.ACTION + '()');
        }
    });
}
