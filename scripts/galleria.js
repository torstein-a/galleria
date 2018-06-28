window.Galleria = !(!window.Galleria && !(function () {
  var _galleries = {};

  // https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach#polyfill
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }
    // Convenience methods
    var _toggleEventListeners = function (elements, events, functions, doRemove) {
      if (!Array.isArray(elements) || !Array.isArray(events) || !Array.isArray(functions)) throw "GALLERIA - not an array";
      elements.forEach(function (element) {
        events.forEach(function (event) {
          functions.forEach(function (func) {
            if (doRemove) {
              element.removeEventListener(event, func);
            } else {
              element.addEventListener(event, func);
            }
          });
        });
    });
  };
  var _addEventListeners = function (elements, events, functions) {
    _toggleEventListeners(elements, events, functions, false);
  };
  var _removeEventListeners = function (elements, events, functions) {
    _toggleEventListeners(elements, events, functions, true)
  };

  // While we're waiting for composedPath/path
  var parentNode = function R(node, parentSelector) {
    if (!parentSelector) throw "Galleria - empty PARENTSELECTOR!";
    if (/BODY|HTML/.test(node.nodeName.toUpperCase())) return false;
    if (node) {
      //TODO: move matches|msMatchesSelector test somewhere downscope?
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
      cycler = new Cycler(reel.length - 1),
      fullscreen = false;

    var swap = function (element) {
      console.log("swap", element)
      reel.forEach(function (t) {
        t.classList.remove('active');
      });
      //element.scrollIntoView(true); // TODO: check compatibility. Scroll to element ABOVE current instead?
      previewer.scrollTop = element.offsetTop;

      var newEl = document.createElement('div');
      newEl.classList.add('image-container');
      element.childNodes.forEach(function(el){
        newEl.appendChild(el.cloneNode(true));
      });

      viewer.replaceChild(newEl, viewer.querySelector('.image-container'));

      element.classList.add('active');
    };

    var smallMode = function () {
      console.log('smallmode')
      bigModeDown();

      _addEventListeners([container], ['mouseover', 'blur'], [smFocus]);
    };

    var smallModeDown = function () {
      console.log('small mode down')
      // tear down normal mode

      //container.removeEventListener('click', smClick);
      _removeEventListeners([container], ['mouseover', 'focus'], [smFocus]);
      _addEventListeners([container], ['mouseout', 'blur'], [smBlur]);
    };

    var bigMode = function () {
      console.log('bigmode')
      smallModeDown();
      // setup fullscreen mode

      container.classList.add('fullscreen');
    };

    var bigModeDown = function () {
      console.log('bigmode down')
      // tear down fullscreen mode
      container.classList.remove('fullscreen');
    };

    var toggleModes = function () {
      fullscreen = !fullscreen;
      if (fullscreen) bigMode();
      else smallMode();
    };

    var smFocus = function () {
      container.classList.add('alive');
      //container.addEventListener('click', smClick);

      _removeEventListeners([container], ['mouseover', 'focus'], [smFocus]);
      _addEventListeners([container], ['mouseout', 'blur'], [smBlur]);
    };

    var smBlur = function () {
      container.classList.remove('alive');
      //container.removeEventListener('click', smClick);
      _addEventListeners([container], ['mouseover', 'focus'], [smFocus]);
      _removeEventListeners([container], ['mouseout', 'blur'], [smBlur]);
    };

/*
    var smClick = function (ev) {
      console.log('click')

      if (ev.target.nodeName.toUpperCase() === 'IMG' || ev.target.classList.contains('image-container')) {
        var image = parentNode(ev.target, '.image-container');

        if (image) {
          cycler.set(image.dataset.index);
          swap(image);
        }
      }

      console.log(ev, image)
      container.removeEventListener('click', smFocus);
      bigMode();
    }*/

    var previewClick = function (ev) {
      ev.preventDefault();
      //ev.stopImmediatePropagation();
      console.log('preview click', ev.target);

      if (!fullscreen) bigMode();

      if (ev.target.nodeName.toUpperCase() === 'IMG' || ev.target.classList.contains('image-container')) {
        var image = parentNode(ev.target, '.image-container');

        if (image) {
          cycler.set(image.dataset.index);
          swap(image);
        }
      }
    };

    smallMode();


    previewer.addEventListener('click', previewClick);

    controls.addEventListener('click', function (ev) {
      ev.preventDefault();
      var target = parentNode(ev.target, 'div.controls > div');

      if (target && (target.classList.contains('left') || target.classList.contains('right'))) {
        if (target.classList.contains('left')) {
          cycler.down();
        } else {
          cycler.up();
        }
        var img = reel[cycler.current()];
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
          cycler.down();
        } else {
          cycler.up();
        }
        var img = reel[cycler.current()];
        swap(img);
      }
    });

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


  var build = function (container, payload) {

    var viewImageContainer = viewer.querySelector('div.image');


    var previewContainer = container.querySelector('div.previewer');


    viewImageContainer.appendChild(thumbnails[0].cloneNode(true));
    thumbnails[0].classList.add('active');


    // Event listeners


  };


  try {
    initGalleries();
  } catch (ex) {
    console.log(ex);
  }

  return {
    galleries: _galleries
  }
})());