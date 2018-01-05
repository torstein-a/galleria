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

    var CirleCounter = function (limit) {
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

    var build = function (container, payload) {
        container.innerHTML = '<div class="viewer">' +
            '<div class="image"></div>' +
            '<div class="controls"><div class="left"><span>&#x25C4;</span></div><div class="right"><span>&#x25BA;</span></div></div>' +
            '</div>' +
            '<div class="previewer"></div>';
        var viewContainer = container.querySelector('div.viewer');
        var viewImageContainer = viewContainer.querySelector('div.image');
        var previewContainer = container.querySelector('div.previewer');
        var controls = container.querySelector('div.controls');

        var thumbnails = payload.images.map(function (item, i) {

            var preview = document.createElement('div');
            preview.className = "image-container";
            var picture = document.createElement('picture');
            var img = document.createElement('img');
            img.setAttribute('src', item.src);
            !!item.alt && img.setAttribute('alt', item.alt);

            picture.appendChild(img);
            preview.appendChild(picture);
            preview.dataset.index = i;

            return preview;
        });

        var counter = CirleCounter(thumbnails.length - 1);

        previewContainer = container.querySelector('div.previewer');

        thumbnails.forEach(function (thumb) {
            previewContainer.appendChild(thumb);
        });

        viewImageContainer.appendChild(thumbnails[0].cloneNode(true));
        thumbnails[0].classList.add('active');

        previewContainer.addEventListener('click', function (ev) {
            ev.preventDefault();
            console.log('preview click', ev.target);
            if (ev.target.nodeName.toUpperCase() === 'IMG' || ev.target.classList.contains('image-container')) {
                var parent = parentNode(ev.target, 'div.image-container');
                thumbnails.forEach(function (t) {
                    t.classList.remove('active');
                });
                console.log(parent);
                if (parent) {
                    counter.set(parent.dataset.index);

                    viewImageContainer.replaceChild(parent.cloneNode(true), viewImageContainer.childNodes[0]);
                    parent.classList.add('active');
                }
            }
        });

        controls.addEventListener('click', function (ev) {
            ev.preventDefault();
            var target = parentNode(ev.target, 'div.controls > div');

            if (target.classList.contains('left') || target.classList.contains('right')) {
                if (target.classList.contains('left')) {
                    counter.down();
                } else {
                    counter.up();
                }

                thumbnails.forEach(function (t) {
                    t.classList.remove('active');
                });

                var img = thumbnails[counter.current()];
                img.scrollIntoView(true); // TODO: check compatibility?
                viewImageContainer.replaceChild(img.cloneNode(true), viewImageContainer.childNodes[0]);
                img.classList.add('active');
            }
        });
    };


    try {
        var container = getContainer('.galleria-container');
        var payload = getPayload(container);
        if (payload) {
            build(container, payload)
        }
    } catch (ex) {
        console.log(ex);
    }
})();