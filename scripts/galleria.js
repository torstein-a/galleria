/**
 * Created by altin on 2018.01.03.
 */

(function () {
    var getContainer = function (selector) {
        if (!selector) throw "Galleria - CONTAINER selector is falsy!";
        var container = document.querySelector(selector);
        if (!container) throw "Galleria - Invalid CONTAINER: \"" + selector + "\"";
        return container;
    };
    var getPayload = function (container) {
        var list = container.getAttribute("data-images");
        if (!list) return null;

        if (/^[{\[]/.test(list)) {
            var obj = JSON.parse(list);
            var typeString = Object.prototype.toString.call(obj);
            if (typeString.indexOf('Array') > 0) {
                return {
                    images: obj.map(function (i) {
                        return {src: i.trim()};
                    })
                }
            }
            if (typeString.indexOf('Object') > 0) {
                return obj
            }
        } else {
            return {
                images: list.split(',').map(function (i) {
                    return {src: i.trim()}
                })
            }
        }
    };

    var parentNode = function R(node, parentSelector) {
        if (!parentSelector) throw "Galleria - empty PARENTSELECTOR!";
        if (/BODY|HTML/.test(node.nodeName.toUpperCase())) return false;
        if (node) {
            if (!!node.matches) {
                return node.matches(parentSelector) ? node : R(node.parentNode, parentSelector);
            }
            if (!!node.msMatchesSelector) {
                return node.msMatchesSelector(parentSelector) ? node : R(node.parentNode, parentSelector);
            }

        }
        return false;
    };

    var Cycler = function (limit) {
        var index = 0;
        var max = limit;

        var up = function () {
            if (index < max) {
                index++;
            } else {
                index = 0;
            }
            return index
        };
        var down = function () {
            if (index > 0) {
                index--;
            } else {
                index = max;
            }
            console.log(index);
            return index
        };
        var set = function (newIndex) {
            if (newIndex <= max && newIndex > 0) {
                index = newIndex;
            }
            console.log(index)
            return index;
        };

        return {
            current: function () {
                return index;
            },
            up: up,
            down: down,
            set: set
        };
    };

    var Galleria = function (container, payload) {
        var cycler, viewer, previewer, reel, controls;

        var init = function () {
            container.setAttribute('tabindex', '0'); // make container reachable for keyboard users
            container.innerHTML = '<div class="viewer">' +
                '<div class="image"></div>' +
                '<div class="controls"><div class="left"><span>&#x25C4;</span></div><div class="right"><span>&#x25BA;</span></div></div>' +
                '</div>' +
                '<div class="previewer"></div>';
            viewer = container.querySelector('div.viewer');

            previewer = container.querySelector('div.previewer');
            controls = container.querySelector('div.controls');

            reel = payload.images.map(function (item, i) {
                var preview = document.createElement('div');
                preview.className = "image-container";
                var picture = document.createElement('picture');
                var img = document.createElement('img');
                img.setAttribute('src', item.src);
                !!item.alt && img.setAttribute('alt', item.alt);

                picture.appendChild(img);
                preview.appendChild(picture);
                preview.dataset.index = i;

                previewer.appendChild(preview);

                return preview;
            });

            cycler = Cycler(reel.length - 1);
        };


        var smallMode = function () {

        };

        var smallModeDown = function() {

        }

        var bigMode = function () {

        };


        // Events

        var smFocus = function(){
            container.addEventListener('click', smClick);
            container.removeEventListener('mouseover focus', smFocus);
        }

        var smClick = function(){
            container.removeEventListener('click', smFocus);
            bigMode();
        }

        return {
            cycler: cycler,
            fullscreen: bigMode,
            preview: smallMode,
            container: container
        };
    };


    var build = function (container, payload) {

        var viewImageContainer = viewer.querySelector('div.image');


        previewContainer = container.querySelector('div.previewer');


        viewImageContainer.appendChild(thumbnails[0].cloneNode(true));
        thumbnails[0].classList.add('active');


        var swap = function (element) {
            thumbnails.forEach(function (t) {
                t.classList.remove('active');
            });
            element.scrollIntoView(true); // TODO: check compatibility. Scroll to element ABOVE current instead?
            viewImageContainer.replaceChild(element.cloneNode(true), viewImageContainer.childNodes[0]);
            element.classList.add('active');
        }

        // Event listeners

        previewContainer.addEventListener('click', function (ev) {
            ev.preventDefault();
            console.log('preview click', ev.target);
            if (ev.target.nodeName.toUpperCase() === 'IMG' || ev.target.classList.contains('image-container')) {
                var image = parentNode(ev.target, 'div.image-container');

                if (image) {
                    counter.set(image.dataset.index);
                    swap(image);
                }
            }
        });

        controls.addEventListener('click', function (ev) {
            ev.preventDefault();
            var target = parentNode(ev.target, 'div.controls > div');

            if (target && (target.classList.contains('left') || target.classList.contains('right'))) {
                if (target.classList.contains('left')) {
                    counter.down();
                } else {
                    counter.up();
                }
                var img = thumbnails[counter.current()];
                swap(img);
            }
        });

        container.addEventListener('keyup', function (ev) {
            var left = 37;
            var right = 39;
            console.log('keyup', ev.keyCode)
            if (ev.keyCode === left || ev.keyCode === right) {
                ev.preventDefault();

                if (ev.keyCode === left) {
                    counter.down();
                } else {
                    counter.up();
                }
                var img = thumbnails[counter.current()];
                swap(img);
            }
        });
    };


    try {
        var container = getContainer('.galleria-container');
        var payload = getPayload(container);
        if (payload) {
            var gallery = Galleria(container, payload);

        }
    } catch (ex) {
        console.log(ex);
    }
})();