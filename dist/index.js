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

	module.exports = __webpack_require__(12);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
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


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var Field, Gallery;

	Field = __webpack_require__(5).Field;

	Gallery = __webpack_require__(13).Gallery;

	module.exports = {
	  Field: Field,
	  Gallery: Gallery
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var $, Acceptor, Asset, Gallery, Monitor, Sortable, Uploader, Viewer;

	$ = __webpack_require__(6);

	Sortable = __webpack_require__(14).Sortable;

	Acceptor = __webpack_require__(7).Acceptor;

	Asset = __webpack_require__(8).Asset;

	Monitor = __webpack_require__(9).Monitor;

	Uploader = __webpack_require__(10).Uploader;

	Viewer = __webpack_require__(11).Viewer;

	Gallery = (function() {
	  Gallery.clsPrefix = 'data-mh-asset-gallery--';

	  function Gallery(input, options) {
	    var j, len, raw_asset, ref;
	    if (options == null) {
	      options = {};
	    }
	    $.config(this, {
	      endpoint: '/upload-asset',
	      label: 'Select a file...'
	    }, options, input, this.constructor.clsPrefix);
	    this._dom = {};
	    this._dom.input = input;
	    this._dom.input.__mh_asset_gallery = this;
	    this._dom.gallery = $.create('div', {
	      'class': this._bem('mh-asset-gallery')
	    });
	    input.parentNode.insertBefore(this._dom.gallery, input);
	    this._dom.assetsView = $.create('div', {
	      'class': this._bem('mh-asset-gallery__assets-view')
	    });
	    this._dom.gallery.appendChild(this._dom.assetsView);
	    this._dom.uploadControl = $.create('div', {
	      'class': this._bem('mh-asset-gallery__upload-control')
	    });
	    this._dom.gallery.appendChild(this._dom.uploadControl);
	    Object.defineProperty(this, 'assets', {
	      get: (function(_this) {
	        return function() {
	          return _this._assets;
	        };
	      })(this)
	    });
	    Object.defineProperty(this, 'assetsView', {
	      value: this._dom.assetsView
	    });
	    Object.defineProperty(this, 'gallery', {
	      value: this._dom.gallery
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
	    Object.defineProperty(this, 'uploadControl', {
	      value: this._dom.uploadControl
	    });
	    this._assetViewers = {};
	    this._assets = [];
	    if (this.input.value) {
	      ref = JSON.parse(this.input.value);
	      for (j = 0, len = ref.length; j < len; j++) {
	        raw_asset = ref[j];
	        this._assets.push(Asset.fromJSONType(raw_asset));
	      }
	    }
	    this._uploader = null;
	    this._upload = null;
	    this._updateUploadControl();
	  }

	  Gallery.prototype.addAsset = function(asset) {
	    var viewer;
	    this._assets.push(asset);
	    this._syncInput();
	    viewer = new Viewer(asset);
	    this._assetViewers[asset.key] = viewer;
	    $.listen(viewer.view, {
	      'mh-assets--remove-asset': (function(_this) {
	        return function(ev) {
	          return _this.removeAsset(ev.asset);
	        };
	      })(this)
	    });
	    this.assetsView.appendChild(viewer.view);
	    this._updateSorting();
	    return $.dispatch(this.input, this._et('change'), {
	      asset: this.asset
	    });
	  };

	  Gallery.prototype.removeAsset = function(asset) {
	    var existingAsset, i, j, len, ref, viewer;
	    ref = this.assets;
	    for (i = j = 0, len = ref.length; j < len; i = ++j) {
	      existingAsset = ref[i];
	      if (asset.key === existingAsset.key) {
	        this._assets.splice(i, 1);
	        break;
	      }
	    }
	    this._syncInput();
	    this._updateSorting();
	    viewer = this._assetViewers[asset.key];
	    if (viewer) {
	      this.assetsView.removeChild(viewer.view);
	      return delete this._assetViewers[asset.key];
	    }
	  };

	  Gallery.prototype._bem = function(block, element, modifier) {
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

	  Gallery.prototype._et = function(eventName) {
	    return "mh-assets--" + eventName;
	  };

	  Gallery.prototype._syncInput = function() {
	    var asset, assets, j, len, ref;
	    assets = [];
	    ref = this.assets;
	    for (j = 0, len = ref.length; j < len; j++) {
	      asset = ref[j];
	      assets.push(asset.toJSONType());
	    }
	    return this.input.value = JSON.stringify(assets);
	  };

	  Gallery.prototype._updateSorting = function() {
	    var sortable;
	    if (this.assetsView.__mh_sortable) {
	      this.assetsView.__mh_sortable.destroy();
	    }
	    if (this.assets.length > 1) {
	      sortable = new Sortable(this.assetsView, {
	        axis: 'horizontal'
	      });
	      return $.listen(sortable.container, {
	        'mh-sortable--sorted': (function(_this) {
	          return function(ev) {
	            var child, j, len, ref, sortedAssets;
	            sortedAssets = [];
	            ref = ev.children;
	            for (j = 0, len = ref.length; j < len; j++) {
	              child = ref[j];
	              sortedAssets.push(child.__mh_viewer.asset);
	            }
	            _this._assets = sortedAssets;
	            return _this._syncInput();
	          };
	        })(this)
	      });
	    }
	  };

	  Gallery.prototype._updateUploadControl = function() {
	    var acceptor, monitor;
	    this.uploadControl.innerHTML = '';
	    if (this.upload) {
	      monitor = new Monitor(this._uploader, this.upload);
	      return this.uploadControl.appendChild(monitor.monitor);
	    } else {
	      acceptor = new Acceptor(this.label);
	      this.uploadControl.appendChild(acceptor.acceptor);
	      this._uploader = new Uploader(acceptor.input, {
	        endpoint: this.endpoint
	      });
	      return $.listen(acceptor.input, {
	        'mh-assets--upload-abort': (function(_this) {
	          return function(ev) {
	            _this._upload = null;
	            return _this._updateUploadControl();
	          };
	        })(this),
	        'mh-assets--upload-error': (function(_this) {
	          return function(ev) {
	            _this._upload = null;
	            return _this._updateUploadControl();
	          };
	        })(this),
	        'mh-assets--upload-start': (function(_this) {
	          return function(ev) {
	            _this._upload = ev.ref;
	            return _this._updateUploadControl();
	          };
	        })(this),
	        'mh-assets--upload-success': (function(_this) {
	          return function(ev) {
	            _this._upload = null;
	            _this._updateUploadControl();
	            return _this.addAsset(ev.asset);
	          };
	        })(this)
	      });
	    }
	  };

	  return Gallery;

	})();

	module.exports = {
	  Gallery: Gallery
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ManhattanSortable=t():e.ManhattanSortable=t()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var o=t[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,__webpack_require__),o.loaded=!0,o.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){r(1),e.exports=r(2)},function(e,t,r){e.exports=r.p+"sortable.css"},function(e,t,r){var o,i,n=function(e,t){return function(){return e.apply(t,arguments)}};o=r(3),i=function(){function Sortable(e,t){var r;null==t&&(t={}),this._grab=n(this._grab,this),this._drop=n(this._drop,this),this._drag=n(this._drag,this),o.config(this,{axis:"vertical",childSelector:null,grabSelector:null},t,e,this.constructor.clsPrefix),this._behaviours={},o.config(this._behaviours,{before:"auto",children:"children",grabber:"self",helper:"clone"},t,e,this.constructor.clsPrefix),this._grabbed=null,this._grabbedOffset=null,this._dom={},this._dom.container=e,this._dom.container.__mh_sortable=this,this._dom.container.classList.add(this._bem("mh-sortable")),Object.defineProperty(this,"container",{value:this._dom.container}),Object.defineProperty(this,"children",{get:function(e){return function(){var t;return function(){var e,r,o,i;for(o=this._dom.children,i=[],e=0,r=o.length;e<r;e++)t=o[e],i.push(t);return i}.call(e)}}(this)}),r=this.constructor.behaviours.children[this._behaviours.children],this._dom.children=r(this),o.listen(document,{mousedown:this._grab,mousemove:this._drag,mouseup:this._drop,touchstart:this._grab,touchmove:this._drag,touchend:this._drop})}return Sortable.clsPrefix="data-mh-sortable--",Sortable.prototype.destroy=function(){return this.container.classList.remove(this._bem("mh-sortable")),o.ignore(document,{mousedown:this._grab,mousemove:this._drag,mouseup:this._drop,touchstart:this._grab,touchmove:this._drag,touchend:this._drop}),delete this._dom.container.__mh_sortable},Sortable.prototype._bem=function(e,t,r){var o;return null==t&&(t=""),null==r&&(r=""),o=e,t&&(o=o+"__"+t),r&&(o=o+"--"+r),o},Sortable.prototype._clearSelection=function(){},Sortable.prototype._et=function(e){return"mh-sortable--"+e},Sortable.prototype._getEventPos=function(e){return e.touches&&(e=e.touches[0]),[e.pageX-window.pageXOffset,e.pageY-window.pageYOffset]},Sortable.prototype._drag=function(e){var t,r,i,n,s,a,h,u,c,l;if(this._grabbed){for(h=this._getEventPos(e),a=[window.pageXOffset,window.pageYOffset],this._dom.helper.style.left=a[0]+h[0]-this._grabbedOffset[0]+"px",this._dom.helper.style.top=a[1]+h[1]-this._grabbedOffset[1]+"px",l=document.elementFromPoint(h[0],h[1]),c=null,u=this._dom.children,n=0,s=u.length;n<s;n++)if(r=u[n],r!==this._grabbed&&r.contains(l)){c=r;break}if(c)return t=this.constructor.behaviours.before[this._behaviours.before],t=t(this,c,h),this.container.removeChild(this._grabbed),t||(c=c.nextElementSibling),this.container.insertBefore(this._grabbed,c),i=this.constructor.behaviours.children[this._behaviours.children],this._dom.children=i(this),o.dispatch(this.container,this._et("sort"),{children:this._dom.children})}},Sortable.prototype._drop=function(e){if(this._grabbed)return this._grabbed.classList.remove(this._bem("mh-sortable-ghost")),this._grabbed=null,this._grabbedOffset=null,document.body.removeChild(this._dom.helper),this._dom.helper=null,this.container.classList.remove(this._bem("mh-sortable",null,"sorting")),o.dispatch(this.container,this._et("sorted"),{children:this._dom.children})},Sortable.prototype._grab=function(e){var t,r,i,n,s,a,h,u,c;if("mousedown"!==e.type.toLowerCase()||1===e.which){for(r=null,c=this._dom.children,s=0,a=c.length;s<a;s++)if(t=c[s],i=this.constructor.behaviours.grabber[this._behaviours.grabber],i(this,t).contains(e.target)){r=t;break}return r?(e.preventDefault(),this._grabbed=r,h=this._getEventPos(e),u=this._grabbed.getBoundingClientRect(),this._grabbedOffset=[h[0]-u.left,h[1]-u.top],n=this.constructor.behaviours.helper[this._behaviours.helper],this._dom.helper=n(this,this._grabbed),document.body.appendChild(this._dom.helper),this._dom.helper.style.left=h[0]-this._grabbedOffset[0]+"px",this._dom.helper.style.top=h[1]-this._grabbedOffset[1]+"px",this._grabbed.classList.add(this._bem("mh-sortable-ghost")),this.container.classList.add(this._bem("mh-sortable",null,"sorting")),o.dispatch(this.container,this._et("grabbed"),{child:r})):void 0}},Sortable.behaviours={before:{auto:function(e,t,r){var o,i,n,s,a,h,u,c;if(c=e.container.getBoundingClientRect().width,e._containerWidth!==c){for(e.axis="vertical",u={},a=e._dom.children,n=0,s=a.length;n<s;n++){if(i=a[n],h=i.getBoundingClientRect().top,u[h]){e.axis="horizontal";break}u[h]=!0}e._containerWidth=c}return(o=e.constructor.behaviours.before.axis)(e,t,r)},axis:function(e,t,r){var o,i;return i=t.getBoundingClientRect(),o=[r[0]-i.left,r[1]-i.top],"vertical"===e.axis?o[1]<i.height/2:o[0]<i.width/2}},children:{children:function(e){var t,r,o;return t=e.container.childNodes,o=1,function(){var e,i,n;for(n=[],e=0,i=t.length;e<i;e++)r=t[e],r.nodeType===o&&n.push(r);return n}()},selector:function(e){return o.many(e.childSelector,e.container)}},grabber:{selector:function(e,t){return o.one(e.grabSelector,t)},self:function(e,t){return t}},helper:{clone:function(e,t){var r,o;return r=t.cloneNode(!0),r.removeAttribute("id"),r.removeAttribute("name"),o=document.defaultView.getComputedStyle(t,"").cssText,r.style.cssText=o,r.style.position="absolute",r.style["pointer-events"]="none",r.classList.add(e._bem("mh-sortable-helper")),r}}},Sortable}(),e.exports={Sortable:i}},function(e,t,r){!function(t,r){e.exports=r()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var o=t[r]={exports:{},id:r,loaded:!1};return e[r].call(o.exports,o,o.exports,__webpack_require__),o.loaded=!0,o.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){e.exports=r(1)},function(e,t){var r,o,i,n,s,a,h,u,c=[].indexOf||function(e){for(var t=0,r=this.length;t<r;t++)if(t in this&&this[t]===e)return t;return-1};o=function(e,t){var r,o,i;null==t&&(t={}),r=document.createElement(e);for(o in t)i=t[o],c.call(r,o)>=0?r[o]=i:r.setAttribute(o,i);return r},h=function(e,t){return null==t&&(t=document),Array.prototype.slice.call(t.querySelectorAll(e))},u=function(e,t){return null==t&&(t=document),t.querySelector(e)},i=function(e,t,r){var o,i,n;null==r&&(r={}),o=document.createEvent("Event"),o.initEvent(t,!0,!0);for(i in r)n=r[i],o[i]=n;return e.dispatchEvent(o)},s=function(e,t){var r,o,i,n;n=[];for(o in t)i=t[o],n.push(function(){var t,n,s,a;for(s=o.split(/\s+/),a=[],t=0,n=s.length;t<n;t++)r=s[t],a.push(e.removeEventListener(r,i));return a}());return n},a=function(e,t){var r,o,i,n;n=[];for(o in t)i=t[o],n.push(function(){var t,n,s,a;for(s=o.split(/\s+/),a=[],t=0,n=s.length;t<n;t++)r=s[t],a.push(e.addEventListener(r,i));return a}());return n},r=function(e,t,r,o,i){var n,s,a,h;null==i&&(i="data-"),a=[];for(s in t)h=t[s],e[s]=h,r.hasOwnProperty(s)&&(e[s]=r[s]),n=i+s.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),o.hasAttribute(n)?"number"==typeof h?a.push(e[s]=parseInt(o.getAttribute(n))):h===!1?a.push(e[s]=!0):a.push(e[s]=o.getAttribute(n)):a.push(void 0);return a},n=function(e){return e.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g,"\\$&")},e.exports={create:o,one:u,many:h,dispatch:i,ignore:s,listen:a,config:r,escapeRegExp:n}}])})}])});

/***/ }
/******/ ])
});
;