
/** export d3scomos **/
if (typeof define === 'function' && define.amd) {
        define("d3scomos", ["d3"], function () { return d3scomos; });
    } else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
        module.exports = d3scomos;
    } else {
        window.d3scomos = d3scomos;
    }
})(window);