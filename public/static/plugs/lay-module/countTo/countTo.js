/**
 * 数字滚动
 */
layui.define(['jquery'], function (exports) {
    "use strict";

    var MOD_NAME = 'countTo',
        $ = layui.jquery;

    var countTo = new function () {
        this.start = function (targetEle, options) {
            options = options || {};

            $.each($(targetEle), function (i, v) {
                var startVal = options.startVal || 0,
                    endVal = options.endVal || Number($(v).text()) || 0,
                    decimals = options.decimals || (String(endVal).indexOf('.') === -1 ? 0 : String(endVal).split('.').pop().length),
                    duration = options.duration || 2000,
                    timeout = 30,
                    step = endVal / (duration - timeout) * timeout;

                if (endVal > startVal) {
                    var timer = setInterval(function () {
                        startVal = startVal + step;
                        if (startVal >= endVal) {
                            clearInterval(timer);
                            startVal = endVal;
                        }
                        $(v).text(startVal.toFixed(decimals));
                    }, timeout);
                }
            });
        }
    }
    exports(MOD_NAME, countTo);
});
