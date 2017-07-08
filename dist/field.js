(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ManhattanAssets"] = factory();
	else
		root["ManhattanAssets"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	module.exports = __webpack_require__(5);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "field.css";

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var $, Acceptor, Asset, Field, Monitor, Uploader, Viewer;

	$ = __webpack_require__(6);

	Acceptor = __webpack_require__(7).Acceptor;

	Asset = __webpack_require__(8).Asset;

	Monitor = __webpack_require__(9).Monitor;

	Uploader = __webpack_require__(10).Uploader;

	Viewer = __webpack_require__(11).Viewer;

	Field = (function() {
	  Field.clsPrefix = 'data-mh-asset-field--';

	  function Field(input, options) {
	    if (options == null) {
	      options = {};
	    }
	    $.config(this, {
	      endpoint: '/upload-asset',
	      label: 'Select a file...'
	    }, options, input, this.constructor.clsPrefix);
	    this._dom = {};
	    this._dom.input = input;
	    this._dom.input.__mh_asset_field = this;
	    this._dom.field = $.create('div', {
	      'class': this._bem('mh-asset-field')
	    });
	    input.parentNode.insertBefore(this._dom.field, input);
	    Object.defineProperty(this, 'asset', {
	      get: (function(_this) {
	        return function() {
	          return _this._asset;
	        };
	      })(this),
	      set: (function(_this) {
	        return function(value) {
	          _this._asset = value;
	          if (_this._asset) {
	            _this.input.value = JSON.stringify(_this._asset.toJSONType());
	          } else {
	            _this.input.value = '';
	          }
	          _this._update();
	          return $.dispatch(_this.input, _this._et('change'), {
	            asset: _this.asset
	          });
	        };
	      })(this)
	    });
	    Object.defineProperty(this, 'field', {
	      value: this._dom.field
	    });
	    Object.defineProperty(this, 'input', {
	      value: this._dom.input
	    });
	    Object.defineProperty(this, 'upload', {
	      get: (function(_this) {
	        return function() {
	          return _this._upload;
	        };
	      })(this)
	    });
	    this.input.style['display'] = 'none';
	    this._asset = null;
	    if (this.input.value) {
	      this._asset = Asset.fromJSONType(JSON.parse(this.input.value));
	    }
	    this._uploader = null;
	    this._upload = null;
	    this._update();
	  }

	  Field.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Field.prototype._et = function(eventName) {
	    return "mh-assets--" + eventName;
	  };

	  Field.prototype._update = function() {
	    var acceptor, monitor, viewer;
	    this.field.innerHTML = '';
	    if (this.asset) {
	      viewer = new Viewer(this.asset);
	      $.listen(viewer.view, {
	        'mh-assets--remove-asset': (function(_this) {
	          return function() {
	            return _this.asset = null;
	          };
	        })(this)
	      });
	      return this.field.appendChild(viewer.view);
	    } else if (this.upload) {
	      monitor = new Monitor(this._uploader, this.upload);
	      return this.field.appendChild(monitor.monitor);
	    } else {
	      acceptor = new Acceptor(this.label);
	      this.field.appendChild(acceptor.acceptor);
	      this._uploader = new Uploader(acceptor.input, {
	        endpoint: this.endpoint
	      });
	      return $.listen(acceptor.input, {
	        'mh-assets--upload-abort': (function(_this) {
	          return function(ev) {
	            _this._upload = null;
	            return _this._update();
	          };
	        })(this),
	        'mh-assets--upload-error': (function(_this) {
	          return function(ev) {
	            _this._upload = null;
	            return _this._update();
	          };
	        })(this),
	        'mh-assets--upload-start': (function(_this) {
	          return function(ev) {
	            _this._upload = ev.ref;
	            return _this._update();
	          };
	        })(this),
	        'mh-assets--upload-success': (function(_this) {
	          return function(ev) {
	            _this._upload = null;
	            return _this.asset = ev.asset;
	          };
	        })(this)
	      });
	    }
	  };

	  return Field;

	})();

	module.exports = {
	  Field: Field
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ManhattanEssentials=t():e.ManhattanEssentials=t()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var n=t[r]={exports:{},id:r,loaded:!1};return e[r].call(n.exports,n,n.exports,__webpack_require__),n.loaded=!0,n.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){e.exports=r(1)},function(e,t){var r,n,o,u,c,i,a,s,l,p,f=[].indexOf||function(e){for(var t=0,r=this.length;t<r;t++)if(t in this&&this[t]===e)return t;return-1};r=function(e,t){var r;if(e.closest)return e.closest(t);for(r=e.matches||e.webkitMatchesSelector||e.mozMatchesSelector||e.msMatchesSelector;e&&!r.call(e,t);)e=e.parentElement;return e},o=function(e,t){var r,n,o;null==t&&(t={}),r=document.createElement(e);for(n in t)o=t[n],f.call(r,n)>=0?r[n]=o:r.setAttribute(n,o);return r},l=function(e,t){return null==t&&(t=document),Array.prototype.slice.call(t.querySelectorAll(e))},p=function(e,t){return null==t&&(t=document),t.querySelector(e)},c=function(e,t,r){var n,o,u;null==r&&(r={}),n=document.createEvent("Event"),n.initEvent(t,!0,!0);for(o in r)u=r[o],n[o]=u;return e.dispatchEvent(n)},a=function(e,t){var r,n,o,u;u=[];for(n in t)o=t[n],u.push(function(){var t,u,c,i;for(c=n.split(/\s+/),i=[],t=0,u=c.length;t<u;t++)r=c[t],i.push(e.removeEventListener(r,o));return i}());return u},s=function(e,t){var r,n,o,u;u=[];for(n in t)o=t[n],u.push(function(){var t,u,c,i;for(c=n.split(/\s+/),i=[],t=0,u=c.length;t<u;t++)r=c[t],i.push(e.addEventListener(r,o));return i}());return u},n=function(e,t,r,n,o){var u,c,i,a;null==o&&(o="data-"),i=[];for(c in t)a=t[c],e[c]=a,r.hasOwnProperty(c)&&(e[c]=r[c]),n&&(u=o+c.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),n.hasAttribute(u)?"number"==typeof a?i.push(e[c]=parseInt(n.getAttribute(u))):a===!1?i.push(e[c]=!0):i.push(e[c]=n.getAttribute(u)):i.push(void 0));return i},i=function(e){return e.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g,"\\$&")},u=function(e){var t;try{document.querySelector(e)}catch(e){return t=e,!1}return!0},e.exports={closest:r,create:o,one:p,many:l,dispatch:c,ignore:a,listen:s,config:n,escapeRegExp:i,cssSelectorSupported:u}}])});

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var $, Acceptor;

	$ = __webpack_require__(6);

	Acceptor = (function() {
	  Acceptor._counter = 0;

	  function Acceptor(label) {
	    if (label == null) {
	      label = 'Select a file...';
	    }
	    this._dom = {};
	    this._dom.acceptor = $.create('div', {
	      'class': this._bem('mh-assets-acceptor')
	    });
	    this._dom.acceptor.__mh_acceptor = this;
	    this._dom.input = $.create('input', {
	      'class': this._bem('mh-assets-acceptor', 'input'),
	      'type': 'file',
	      'name': "acceptor__" + (this._newId())
	    });
	    this._dom.acceptor.appendChild(this._dom.input);
	    this._dom.label = $.create('div', {
	      'class': this._bem('mh-assets-acceptor', 'label')
	    });
	    this._dom.label.textContent = label;
	    this._dom.acceptor.appendChild(this._dom.label);
	    Object.defineProperty(this, 'acceptor', {
	      value: this._dom.acceptor
	    });
	    Object.defineProperty(this, 'input', {
	      value: this._dom.input
	    });
	  }

	  Acceptor.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Acceptor.prototype._newId = function() {
	    Acceptor._counter += 1;
	    return Acceptor._counter;
	  };

	  return Acceptor;

	})();

	module.exports = {
	  Acceptor: Acceptor
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	var Asset, AssetMeta;

	Asset = (function() {
	  function Asset(key, filename, type, contentType, urls, coreMeta, userMeta, variations) {
	    this._key = key;
	    this._filename = filename;
	    this._type = type;
	    this._contentType = contentType;
	    this._urls = urls;
	    this.meta = new AssetMeta(coreMeta, userMeta);
	    this._variations = variations;
	    Object.defineProperty(this, 'key', {
	      value: this._key
	    });
	    Object.defineProperty(this, 'filename', {
	      value: this._filename
	    });
	    Object.defineProperty(this, 'type', {
	      value: this._type
	    });
	    Object.defineProperty(this, 'contentType', {
	      value: this._contentType
	    });
	    Object.defineProperty(this, 'urls', {
	      get: (function(_this) {
	        return function() {
	          var k, ref, v;
	          urls = {};
	          ref = _this._urls;
	          for (k in ref) {
	            v = ref[k];
	            urls[k] = v;
	          }
	          return urls;
	        };
	      })(this)
	    });
	  }

	  Asset.prototype.toJSONType = function() {
	    return {
	      'key': this.key,
	      'filename': this.filename,
	      'type': this.type,
	      'content_type': this.contentType,
	      'url': this.urls.origin,
	      'core_meta': this.meta.getCoreMeta(),
	      'user_meta': this.meta.getUserMeta(),
	      'variations': this._variations
	    };
	  };

	  Asset.fromJSONType = function(data) {
	    var urls;
	    urls = {
	      'origin': data.url
	    };
	    if (data.type === 'image') {
	      if (data.variations) {
	        if (data.variations['--base--']) {
	          urls.draft = data.variations['--base--'].url;
	        }
	        if (data.variations['--thumb--']) {
	          urls.thumb = data.variations['--thumb--'].url;
	        }
	      }
	    }
	    return new Asset(data.key, data.filename, data.type, data.content_type, urls, data.core_meta, data.user_meta, data.variations);
	  };

	  return Asset;

	})();

	AssetMeta = (function() {
	  function AssetMeta(coreMeta, userMeta) {
	    var _, getter, k, name, ref, ref1, setter, v;
	    this._coreMeta = coreMeta || {};
	    this._coreOverrides = {};
	    getter = (function(_this) {
	      return function(name) {
	        _this = _this;
	        return function() {
	          if (_this._coreOverrides[name] !== void 0) {
	            return _this._coreOverrides[name];
	          }
	          if (_this._coreMeta[name] !== void 0) {
	            return _this._coreMeta[name];
	          }
	        };
	      };
	    })(this);
	    setter = (function(_this) {
	      return function(name) {
	        _this = _this;
	        return function(value) {
	          return _this._coreOverrides[name] = value;
	        };
	      };
	    })(this);
	    ref = this._coreMeta;
	    for (name in ref) {
	      _ = ref[name];
	      Object.defineProperty(this, name, {
	        get: getter(name),
	        set: setter(name)
	      });
	    }
	    ref1 = userMeta || {};
	    for (k in ref1) {
	      v = ref1[k];
	      this[k] = v;
	    }
	  }

	  AssetMeta.prototype.getCoreMeta = function() {
	    return JSON.parse(JSON.stringify(this._coreMeta));
	  };

	  AssetMeta.prototype.getUserMeta = function() {
	    var data, k, ref, v;
	    data = JSON.parse(JSON.stringify(this._coreOverrides));
	    ref = this;
	    for (k in ref) {
	      v = ref[k];
	      if (this.hasOwnProperty(k) && !this[k] instanceof Function) {
	        data[k] = v;
	      }
	    }
	    return JSON.parse(JSON.stringify(data));
	  };

	  return AssetMeta;

	})();

	module.exports = {
	  Asset: Asset
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var $, Monitor;

	$ = __webpack_require__(6);

	Monitor = (function() {
	  function Monitor(uploader, upload) {
	    this._uploader = uploader;
	    this._upload = upload;
	    this._dom = {};
	    this._dom.monitor = $.create('div', {
	      'class': this._bem('mh-assets-monitor')
	    });
	    this._dom.monitor.__mh_monitor = this;
	    Object.defineProperty(this, 'uploader', {
	      value: this._uploader
	    });
	    Object.defineProperty(this, 'upload', {
	      value: this._upload
	    });
	    Object.defineProperty(this, 'monitor', {
	      value: this._dom.monitor
	    });
	    $.listen(this.uploader.input, {
	      'mh-assets--upload-progress': (function(_this) {
	        return function(ev) {
	          if (ev.ref !== _this.upload) {
	            return;
	          }
	          _this._dom.gauge.setAttribute('data-mh-progress', (parseInt(ev.progress * 100)) + "%");
	          return _this._dom.progress.style['width'] = (ev.progress * 100) + "%";
	        };
	      })(this),
	      'mh-assets--upload-end': (function(_this) {
	        return function(ev) {
	          if (ev.ref !== _this.upload) {
	            return;
	          }
	          _this.monitor.classList.add(_this._bem('mh-asset-monitor', '', 'complete'));
	          return $.dispatch(_this.monitor, _this._et('monitor-complete'));
	        };
	      })(this)
	    });
	    this._template();
	  }

	  Monitor.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Monitor.prototype._et = function(eventName) {
	    return "mh-assets--" + eventName;
	  };

	  Monitor.prototype._template = function() {
	    this._dom.gauge = $.create('div', {
	      'class': this._bem('mh-assets-monitor', 'gauge'),
	      'data-mh-progress': '0%'
	    });
	    this.monitor.appendChild(this._dom.gauge);
	    this._dom.progress = $.create('div', {
	      'class': this._bem('mh-assets-monitor', 'progress')
	    });
	    this._dom.gauge.appendChild(this._dom.progress);
	    this._dom.cancel = $.create('div', {
	      'class': this._bem('mh-assets-monitor', 'cancel')
	    });
	    this.monitor.appendChild(this._dom.cancel);
	    return $.listen(this._dom.cancel, {
	      'click': (function(_this) {
	        return function(ev) {
	          ev.preventDefault();
	          return _this.uploader.cancel(_this.upload);
	        };
	      })(this)
	    });
	  };

	  return Monitor;

	})();

	module.exports = {
	  Monitor: Monitor
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var $, Asset, Uploader;

	$ = __webpack_require__(6);

	Asset = __webpack_require__(8).Asset;

	Uploader = (function() {
	  function Uploader(input, options) {
	    if (options == null) {
	      options = {};
	    }
	    this._dom = {};
	    this._dom.input = input;
	    this._dom.input.__mh_assets_uploader = this;
	    this._uploads = {};
	    this._queued_uploads = [];
	    Object.defineProperty(this, 'input', {
	      value: this._dom.input
	    });
	    Object.defineProperty(this, 'uploadCount', {
	      get: (function(_this) {
	        return function() {
	          var _, ref;
	          return ((function() {
	            var ref1, results;
	            ref1 = this._uploads;
	            results = [];
	            for (ref in ref1) {
	              _ = ref1[ref];
	              results.push(ref);
	            }
	            return results;
	          }).call(_this)).length;
	        };
	      })(this)
	    });
	    $.config(this, {
	      allowMultiple: false,
	      endpoint: '/cms/upload-asset',
	      maxConcurrentUploads: 2
	    }, options);
	    this._behaviours = {};
	    $.config(this._behaviours, {
	      formData: 'manhattan',
	      response: 'manhattan'
	    }, options);
	    if (this.allowMultiple) {
	      this.input.setAttribute('multiple', true);
	    }
	    $.listen(this.input, {
	      'change': (function(_this) {
	        return function(ev) {
	          var file, i, len, ref1;
	          if (_this.allowMultiple) {
	            ref1 = ev.target.files;
	            for (i = 0, len = ref1.length; i < len; i++) {
	              file = ref1[i];
	              _this._upload(file);
	            }
	          } else {
	            _this._upload(ev.target.files[0]);
	          }
	          _this.input.value = '';
	          if (_this.input.value) {
	            _this.input.type = 'text';
	            return _this.input.type = 'file';
	          }
	        };
	      })(this)
	    });
	  }

	  Uploader.prototype.cancel = function(ref) {
	    var _, req, results;
	    if (ref) {
	      if (this._uploads[ref]) {
	        return ref.abort();
	      }
	    } else {
	      results = [];
	      for (req in uploads) {
	        _ = uploads[req];
	        results.push(req.abort());
	      }
	      return results;
	    }
	  };

	  Uploader.prototype.progress = function(ref) {
	    var _, info, progress;
	    if (ref) {
	      if (this._uploads[ref]) {
	        return this._uploads[ref].progress;
	      }
	    } else {
	      progress = 0;
	      for (_ in uploads) {
	        info = uploads[_];
	        progress += info.progress;
	      }
	      return progress / Math.max(1, this.uploadCount);
	    }
	  };

	  Uploader.prototype._clear = function(ref) {
	    var queued;
	    if (this._uploads[ref]) {
	      delete this._uploads[ref];
	    }
	    if (this._queued_uploads.length > 0) {
	      queued = this._queued_uploads.shift();
	      this._start_upload(queued[0], queued[1]);
	    }
	    return $.dispatch(this.input, this._et('upload-end'), {
	      'ref': ref
	    });
	  };

	  Uploader.prototype._start_upload = function(req, formData) {
	    this._uploads[req] = {
	      'progress': 0
	    };
	    $.dispatch(this.input, this._et('upload-start'), {
	      'ref': req
	    });
	    req.open('POST', this.endpoint, true);
	    return req.send(formData);
	  };

	  Uploader.prototype._et = function(eventName) {
	    return "mh-assets--" + eventName;
	  };

	  Uploader.prototype._on_abort = function(ref) {
	    if (!this._uploads[ref]) {
	      return;
	    }
	    $.dispatch(this.input, this._et('upload-abort'), {
	      'ref': ref
	    });
	    return this._clear(ref);
	  };

	  Uploader.prototype._on_error = function(ref, reason) {
	    if (reason == null) {
	      reason = '';
	    }
	    if (!this._uploads[ref]) {
	      return;
	    }
	    $.dispatch(this.input, this._et('upload-error'), {
	      'ref': ref,
	      'reason': reason
	    });
	    return this._clear(ref);
	  };

	  Uploader.prototype._on_progress = function(ref, progress) {
	    if (!this._uploads[ref]) {
	      return;
	    }
	    this._uploads[ref].progress = progress;
	    return $.dispatch(this.input, this._et('upload-progress'), {
	      'ref': ref,
	      'progress': progress
	    });
	  };

	  Uploader.prototype._on_success = function(ref, asset) {
	    if (!this._uploads[ref]) {
	      return;
	    }
	    $.dispatch(this.input, this._et('upload-success'), {
	      'ref': ref,
	      'asset': asset
	    });
	    return this._clear(ref);
	  };

	  Uploader.prototype._upload = function(file) {
	    var behaviour, behaviourName, formData, on_abort, on_error, on_load, on_progress, req;
	    behaviourName = this._behaviours.formData;
	    behaviour = this.constructor.behaviours.formData[behaviourName];
	    formData = behaviour(this, file);
	    req = new XMLHttpRequest();
	    on_progress = function(uploader, req) {
	      return function(ev) {
	        return uploader._on_progress(req, ev.loaded / ev.total);
	      };
	    };
	    req.upload.addEventListener('progress', on_progress(this, req));
	    on_load = function(uploader, req) {
	      return function(ev) {
	        var assetOrError, behaviours, res;
	        res = ev.target.responseText;
	        behaviourName = uploader._behaviours.response;
	        behaviours = uploader.constructor.behaviours;
	        behaviour = behaviours.response[behaviourName];
	        assetOrError = behaviour(this, req.responseText);
	        if (assetOrError instanceof Asset) {
	          return uploader._on_success(req, assetOrError);
	        } else {
	          return uploader._on_error(req, assetOrError.message);
	        }
	      };
	    };
	    req.addEventListener('load', on_load(this, req));
	    on_error = function(uploader, req) {
	      return function(ev) {
	        return uploader._on_error(req);
	      };
	    };
	    req.addEventListener('error', on_error(this, req));
	    on_abort = function(uploader, req) {
	      return function(ev) {
	        return uploader._on_abort(req);
	      };
	    };
	    req.addEventListener('abort', on_abort(this, req));
	    if (this.uploadCount < this.maxConcurrentUploads) {
	      return this._start_upload(req, formData);
	    } else {
	      return this._queued_uploads.push([req, formData]);
	    }
	  };

	  Uploader.behaviours = {
	    formData: {
	      'manhattan': function(uploader, file) {
	        var csfrToken, formData;
	        formData = new FormData();
	        formData.append('file', file);
	        csfrToken = $.one('[name="csrf_token"]', uploader.input.form);
	        if (csfrToken) {
	          formData.append('csrf_token', csfrToken.value);
	        }
	        return formData;
	      }
	    },
	    response: {
	      'manhattan': function(uploader, raw_res) {
	        var e, res;
	        try {
	          res = JSON.parse(raw_res);
	        } catch (error) {
	          e = error;
	          return new Error('Unable to parse response');
	        }
	        if (res.status === 'success') {
	          return Asset.fromJSONType(res.payload.asset);
	        } else {
	          return new Error(res.payload.reason);
	        }
	      }
	    }
	  };

	  return Uploader;

	})();

	module.exports = {
	  Uploader: Uploader
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var $, Viewer;

	$ = __webpack_require__(6);

	Viewer = (function() {
	  function Viewer(asset) {
	    this._asset = asset;
	    this._dom = {};
	    this._dom.view = $.create('div', {
	      'class': this._bem('mh-assets-view')
	    });
	    this._dom.view.__mh_viewer = this;
	    Object.defineProperty(this, 'asset', {
	      value: this._asset
	    });
	    Object.defineProperty(this, 'view', {
	      value: this._dom.view
	    });
	    this._template();
	    this._populate();
	  }

	  Viewer.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Viewer.prototype._et = function(eventName) {
	    return "mh-assets--" + eventName;
	  };

	  Viewer.prototype._populate = function() {
	    var size, unit;
	    if (this.asset.type === 'image') {
	      this.view.classList.add(this._bem('mh-assets-view', '', 'image'));
	    } else {
	      this.view.classList.add(this._bem('mh-assets-view', '', 'file'));
	    }
	    if (this.asset.type === 'image') {
	      this._dom.thumb.style['background-image'] = "url(" + this.asset.urls.thumb + ")";
	    } else {
	      this._dom.icon.setAttribute('data-mh-content-type', this.asset.contentType);
	    }
	    this._dom.filename.textContent = this.asset.filename;
	    if (this.asset.meta.length) {
	      size = this.asset.meta.length / 1000;
	      unit = 'kb';
	      if (size > 1000) {
	        size = size / 1000;
	        unit = 'mb';
	      }
	      size = size.toFixed(1);
	      size = size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	      this._dom.fileSize.textContent = "" + size + unit;
	    }
	    return this._dom.download.setAttribute('href', this.asset.urls.origin);
	  };

	  Viewer.prototype._template = function() {
	    this._dom.content = $.create('div', {
	      'class': this._bem('mh-assets-view', 'content')
	    });
	    this.view.appendChild(this._dom.content);
	    this._dom.icon = $.create('div', {
	      'class': this._bem('mh-assets-view', 'icon')
	    });
	    this._dom.content.appendChild(this._dom.icon);
	    this._dom.thumb = $.create('div', {
	      'class': this._bem('mh-assets-view', 'thumb')
	    });
	    this._dom.content.appendChild(this._dom.thumb);
	    this._dom.info = $.create('div', {
	      'class': this._bem('mh-assets-view', 'info')
	    });
	    this.view.appendChild(this._dom.info);
	    this._dom.filename = $.create('div', {
	      'class': this._bem('mh-assets-view', 'filename')
	    });
	    this._dom.info.appendChild(this._dom.filename);
	    this._dom.fileSize = $.create('div', {
	      'class': this._bem('mh-assets-view', 'file-size')
	    });
	    this._dom.info.appendChild(this._dom.fileSize);
	    this._dom.actions = $.create('div', {
	      'class': this._bem('mh-assets-view', 'actions')
	    });
	    this.view.appendChild(this._dom.actions);
	    this._dom.download = $.create('a', {
	      'download': true,
	      'target': '_blank'
	    });
	    this._dom.download.classList.add(this._bem('mh-assets-view', 'action'));
	    this._dom.download.classList.add(this._bem('mh-assets-view', 'action', 'download'));
	    this._dom.download.textContent = 'Download';
	    this._dom.actions.appendChild(this._dom.download);
	    this._dom.remove = $.create('a', {
	      'href': '#'
	    });
	    this._dom.remove.classList.add(this._bem('mh-assets-view', 'action'));
	    this._dom.remove.classList.add(this._bem('mh-assets-view', 'action', 'remove'));
	    this._dom.remove.textContent = 'Remove';
	    this._dom.actions.appendChild(this._dom.remove);
	    return $.listen(this._dom.remove, {
	      'click': (function(_this) {
	        return function(ev) {
	          ev.preventDefault();
	          return $.dispatch(_this.view, _this._et('remove-asset'), {
	            asset: _this.asset
	          });
	        };
	      })(this)
	    });
	  };

	  return Viewer;

	})();

	module.exports = {
	  Viewer: Viewer
	};


/***/ }
/******/ ])
});
;