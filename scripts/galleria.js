/**
 * Created by altin on 2018.01.03.
 */

window.Galleria = window.Galleria || (function () {
        var _galleries = {};

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

        var Galleri = function (container) {
            //TODO: sanity check?

            var viewer = container.querySelector('.viewer'),
                previewer = container.querySelector('.previewer'),
                controls = container.querySelector('.controls'),
                reel = previewer.querySelectorAll('.image-container'),
                cycler = new Cycler(reel.length-1),
                fullscreen = false;


            var smallMode = function () {
                console.log('smallmode')
                bigModeDown();

                var x = container.addEventListener('mouseover focus', smFocus);
                console.log(x)
            };

            var smallModeDown = function () {
                console.log('small mode down')
                // tear down normal mode
                container.removeEventListener('click', smClick)
                container.removeEventListener('mouseover focus', smFocus);
                container.removeEventListener('mouseout blur', smBlur);
            }

            var bigMode = function () {
                console.log('bigmode')
                smallModeDown();
                // setup fullscreen mode

                container.classList.add('fullscreen');
            };

            var bigModeDown = function(){
                console.log('bigmode down')
                // tear down fullscreen mode
                container.classList.remove('fullscreen');
            };

            var toggleModes = function(){
                fullscreen = !fullscreen;
                if (fullscreen) bigMode();
                else smallMode();
            };

            var smFocus = function () {
                console.log('focus')
                container.addEventListener('click', smClick);
                container.removeEventListener('mouseover focus', smFocus);
                container.addEventListener('mouseout blur', smBlur);
            };

            var smBlur = function () {
                console.log('blur')
                container.removeEventListener('click', smClick)
                container.removeEventListener('mouseout blur', smBlur);
                container.addEventListener('mouseover focus', smFocus);
            };

            var smClick = function () {
                console.log('click')
                container.removeEventListener('click', smFocus);
                bigMode();
            }

            smallMode();

            return {
                cycler: cycler,
                fullscreen: bigMode,
                preview: smallMode,
                toggle: toggleModes,
                container: container
            };
        };


        var initGalleries = function () {
            var containers = document.querySelectorAll('.galleria-container');

            Array.prototype.forEach.call(containers, function (container) {
                console.log(container)
                var id = container.getAttribute('id');
                if (id && _galleries[id]) return; // Allready init'd

                // TODO: check container structure, add missing elements
                // TODO: allow setting image container reel via dataset
                // TODO: allow setting/changing image container reel by script

                do {
                    id = 'g' + ('0000' + (Math.floor(Math.random() * 99999)).toString(32)).substr(-4);
                } while (Object.keys(_galleries).indexOf(id) > -1);

                container.setAttribute('id', id)
                container.setAttribute('tabindex', '0')


                _galleries[id] = new Galleri(container);
            });

            console.log(_galleries)
        }





        var parentNode = function R(node, parentSelector) {
            if (!parentSelector) throw "Galleria - empty PARENTSELECTOR!";
            if (/BODY|HTML/.test(node.nodeName.toUpperCase())) return false;
            if (node) {
                //TODO: move matches|msMatchesSelector test somewhere downscope
                if (!!node.matches) {
                    return node.matches(parentSelector) ? node : R(node.parentNode, parentSelector);
                }
                if (!!node.msMatchesSelector) {
                    return node.msMatchesSelector(parentSelector) ? node : R(node.parentNode, parentSelector);
                }

            }
            return false;
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
            initGalleries();
        } catch (ex) {
            console.log(ex);
        }

        return {
            galleries: _galleries
        }
    })();