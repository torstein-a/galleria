/*
 * Breakpoint change event.
 *
 * Uses Bootstrap 4 breakpoints.
 */

window._breakpoint = window._breakpoint ||
    (function () {
        var breakpointChangeEvent = document.createEvent('Event');
        breakpointChangeEvent.initEvent('breakpoint-change', true, false);

        var br = {
            changed: function () {
                return this.current !== whichBreakpoint();
            },
            current: null,
            previous: null
        };

        var emitEvent = function () {
            if (br.changed()) {
                br.previous = br.current;
                br.current = whichBreakpoint();

                window.dispatchEvent(breakpointChangeEvent);
            }
        }

        var whichBreakpoint = function () {
            var w = window.innerWidth || document.body.clientWidth, br = 'xs';
            if (w >= 576) br = 'sm';
            if (w >= 768) br = 'md';
            if (w >= 992) br = 'lg';
            if (w >= 1200) br = 'xl';
            return br;
        };

        window.addEventListener('load', emitEvent);
        window.addEventListener('resize', emitEvent);

        return br;
    })();