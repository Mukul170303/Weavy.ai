import {
  task
} from "./chunk-2OMWR522.mjs";
import {
  __commonJS,
  __name,
  __require,
  __toESM,
  init_esm
} from "./chunk-H4SOERNS.mjs";

// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports, module) {
    init_esm();
    module.exports = isexe;
    isexe.sync = sync;
    var fs2 = __require("fs");
    function checkPathExt(path2, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path2.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    __name(checkPathExt, "checkPathExt");
    function checkStat(stat, path2, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path2, options);
    }
    __name(checkStat, "checkStat");
    function isexe(path2, options, cb) {
      fs2.stat(path2, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path2, options));
      });
    }
    __name(isexe, "isexe");
    function sync(path2, options) {
      return checkStat(fs2.statSync(path2), path2, options);
    }
    __name(sync, "sync");
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports, module) {
    init_esm();
    module.exports = isexe;
    isexe.sync = sync;
    var fs2 = __require("fs");
    function isexe(path2, options, cb) {
      fs2.stat(path2, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    __name(isexe, "isexe");
    function sync(path2, options) {
      return checkStat(fs2.statSync(path2), options);
    }
    __name(sync, "sync");
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    __name(checkStat, "checkStat");
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
    __name(checkMode, "checkMode");
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/isexe/index.js"(exports, module) {
    init_esm();
    var fs2 = __require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module.exports = isexe;
    isexe.sync = sync;
    function isexe(path2, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path2, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path2, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    __name(isexe, "isexe");
    function sync(path2, options) {
      try {
        return core.sync(path2, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
    __name(sync, "sync");
  }
});

// node_modules/fluent-ffmpeg/node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/fluent-ffmpeg/node_modules/which/which.js"(exports, module) {
    init_esm();
    module.exports = which;
    which.sync = whichSync;
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path2 = __require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    function getNotFoundError(cmd) {
      var er = new Error("not found: " + cmd);
      er.code = "ENOENT";
      return er;
    }
    __name(getNotFoundError, "getNotFoundError");
    function getPathInfo(cmd, opt) {
      var colon = opt.colon || COLON;
      var pathEnv = opt.path || process.env.PATH || "";
      var pathExt = [""];
      pathEnv = pathEnv.split(colon);
      var pathExtExe = "";
      if (isWindows) {
        pathEnv.unshift(process.cwd());
        pathExtExe = opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM";
        pathExt = pathExtExe.split(colon);
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      if (cmd.match(/\//) || isWindows && cmd.match(/\\/))
        pathEnv = [""];
      return {
        env: pathEnv,
        ext: pathExt,
        extExe: pathExtExe
      };
    }
    __name(getPathInfo, "getPathInfo");
    function which(cmd, opt, cb) {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      var info = getPathInfo(cmd, opt);
      var pathEnv = info.env;
      var pathExt = info.ext;
      var pathExtExe = info.extExe;
      var found = [];
      (/* @__PURE__ */ __name(function F(i, l) {
        if (i === l) {
          if (opt.all && found.length)
            return cb(null, found);
          else
            return cb(getNotFoundError(cmd));
        }
        var pathPart = pathEnv[i];
        if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
          pathPart = pathPart.slice(1, -1);
        var p = path2.join(pathPart, cmd);
        if (!pathPart && /^\.[\\\/]/.test(cmd)) {
          p = cmd.slice(0, 2) + p;
        }
        ;
        (/* @__PURE__ */ __name(function E(ii, ll) {
          if (ii === ll) return F(i + 1, l);
          var ext = pathExt[ii];
          isexe(p + ext, { pathExt: pathExtExe }, function(er, is) {
            if (!er && is) {
              if (opt.all)
                found.push(p + ext);
              else
                return cb(null, p + ext);
            }
            return E(ii + 1, ll);
          });
        }, "E"))(0, pathExt.length);
      }, "F"))(0, pathEnv.length);
    }
    __name(which, "which");
    function whichSync(cmd, opt) {
      opt = opt || {};
      var info = getPathInfo(cmd, opt);
      var pathEnv = info.env;
      var pathExt = info.ext;
      var pathExtExe = info.extExe;
      var found = [];
      for (var i = 0, l = pathEnv.length; i < l; i++) {
        var pathPart = pathEnv[i];
        if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
          pathPart = pathPart.slice(1, -1);
        var p = path2.join(pathPart, cmd);
        if (!pathPart && /^\.[\\\/]/.test(cmd)) {
          p = cmd.slice(0, 2) + p;
        }
        for (var j = 0, ll = pathExt.length; j < ll; j++) {
          var cur = p + pathExt[j];
          var is;
          try {
            is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    }
    __name(whichSync, "whichSync");
  }
});

// node_modules/fluent-ffmpeg/lib/utils.js
var require_utils = __commonJS({
  "node_modules/fluent-ffmpeg/lib/utils.js"(exports, module) {
    "use strict";
    init_esm();
    var exec = __require("child_process").exec;
    var isWindows = __require("os").platform().match(/win(32|64)/);
    var which = require_which();
    var nlRegexp = /\r\n|\r|\n/g;
    var streamRegexp = /^\[?(.*?)\]?$/;
    var filterEscapeRegexp = /[,]/;
    var whichCache = {};
    function parseProgressLine(line) {
      var progress = {};
      line = line.replace(/=\s+/g, "=").trim();
      var progressParts = line.split(" ");
      for (var i = 0; i < progressParts.length; i++) {
        var progressSplit = progressParts[i].split("=", 2);
        var key = progressSplit[0];
        var value = progressSplit[1];
        if (typeof value === "undefined")
          return null;
        progress[key] = value;
      }
      return progress;
    }
    __name(parseProgressLine, "parseProgressLine");
    var utils = module.exports = {
      isWindows,
      streamRegexp,
      /**
       * Copy an object keys into another one
       *
       * @param {Object} source source object
       * @param {Object} dest destination object
       * @private
       */
      copy: /* @__PURE__ */ __name(function(source, dest) {
        Object.keys(source).forEach(function(key) {
          dest[key] = source[key];
        });
      }, "copy"),
      /**
       * Create an argument list
       *
       * Returns a function that adds new arguments to the list.
       * It also has the following methods:
       * - clear() empties the argument list
       * - get() returns the argument list
       * - find(arg, count) finds 'arg' in the list and return the following 'count' items, or undefined if not found
       * - remove(arg, count) remove 'arg' in the list as well as the following 'count' items
       *
       * @private
       */
      args: /* @__PURE__ */ __name(function() {
        var list = [];
        var argfunc = /* @__PURE__ */ __name(function() {
          if (arguments.length === 1 && Array.isArray(arguments[0])) {
            list = list.concat(arguments[0]);
          } else {
            list = list.concat([].slice.call(arguments));
          }
        }, "argfunc");
        argfunc.clear = function() {
          list = [];
        };
        argfunc.get = function() {
          return list;
        };
        argfunc.find = function(arg, count) {
          var index = list.indexOf(arg);
          if (index !== -1) {
            return list.slice(index + 1, index + 1 + (count || 0));
          }
        };
        argfunc.remove = function(arg, count) {
          var index = list.indexOf(arg);
          if (index !== -1) {
            list.splice(index, (count || 0) + 1);
          }
        };
        argfunc.clone = function() {
          var cloned = utils.args();
          cloned(list);
          return cloned;
        };
        return argfunc;
      }, "args"),
      /**
       * Generate filter strings
       *
       * @param {String[]|Object[]} filters filter specifications. When using objects,
       *   each must have the following properties:
       * @param {String} filters.filter filter name
       * @param {String|Array} [filters.inputs] (array of) input stream specifier(s) for the filter,
       *   defaults to ffmpeg automatically choosing the first unused matching streams
       * @param {String|Array} [filters.outputs] (array of) output stream specifier(s) for the filter,
       *   defaults to ffmpeg automatically assigning the output to the output file
       * @param {Object|String|Array} [filters.options] filter options, can be omitted to not set any options
       * @return String[]
       * @private
       */
      makeFilterStrings: /* @__PURE__ */ __name(function(filters) {
        return filters.map(function(filterSpec) {
          if (typeof filterSpec === "string") {
            return filterSpec;
          }
          var filterString = "";
          if (Array.isArray(filterSpec.inputs)) {
            filterString += filterSpec.inputs.map(function(streamSpec) {
              return streamSpec.replace(streamRegexp, "[$1]");
            }).join("");
          } else if (typeof filterSpec.inputs === "string") {
            filterString += filterSpec.inputs.replace(streamRegexp, "[$1]");
          }
          filterString += filterSpec.filter;
          if (filterSpec.options) {
            if (typeof filterSpec.options === "string" || typeof filterSpec.options === "number") {
              filterString += "=" + filterSpec.options;
            } else if (Array.isArray(filterSpec.options)) {
              filterString += "=" + filterSpec.options.map(function(option) {
                if (typeof option === "string" && option.match(filterEscapeRegexp)) {
                  return "'" + option + "'";
                } else {
                  return option;
                }
              }).join(":");
            } else if (Object.keys(filterSpec.options).length) {
              filterString += "=" + Object.keys(filterSpec.options).map(function(option) {
                var value = filterSpec.options[option];
                if (typeof value === "string" && value.match(filterEscapeRegexp)) {
                  value = "'" + value + "'";
                }
                return option + "=" + value;
              }).join(":");
            }
          }
          if (Array.isArray(filterSpec.outputs)) {
            filterString += filterSpec.outputs.map(function(streamSpec) {
              return streamSpec.replace(streamRegexp, "[$1]");
            }).join("");
          } else if (typeof filterSpec.outputs === "string") {
            filterString += filterSpec.outputs.replace(streamRegexp, "[$1]");
          }
          return filterString;
        });
      }, "makeFilterStrings"),
      /**
       * Search for an executable
       *
       * Uses 'which' or 'where' depending on platform
       *
       * @param {String} name executable name
       * @param {Function} callback callback with signature (err, path)
       * @private
       */
      which: /* @__PURE__ */ __name(function(name, callback) {
        if (name in whichCache) {
          return callback(null, whichCache[name]);
        }
        which(name, function(err, result) {
          if (err) {
            return callback(null, whichCache[name] = "");
          }
          callback(null, whichCache[name] = result);
        });
      }, "which"),
      /**
       * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
       *
       * @param {String} timemark timemark string
       * @return Number
       * @private
       */
      timemarkToSeconds: /* @__PURE__ */ __name(function(timemark) {
        if (typeof timemark === "number") {
          return timemark;
        }
        if (timemark.indexOf(":") === -1 && timemark.indexOf(".") >= 0) {
          return Number(timemark);
        }
        var parts = timemark.split(":");
        var secs = Number(parts.pop());
        if (parts.length) {
          secs += Number(parts.pop()) * 60;
        }
        if (parts.length) {
          secs += Number(parts.pop()) * 3600;
        }
        return secs;
      }, "timemarkToSeconds"),
      /**
       * Extract codec data from ffmpeg stderr and emit 'codecData' event if appropriate
       * Call it with an initially empty codec object once with each line of stderr output until it returns true
       *
       * @param {FfmpegCommand} command event emitter
       * @param {String} stderrLine ffmpeg stderr output line
       * @param {Object} codecObject object used to accumulate codec data between calls
       * @return {Boolean} true if codec data is complete (and event was emitted), false otherwise
       * @private
       */
      extractCodecData: /* @__PURE__ */ __name(function(command, stderrLine, codecsObject) {
        var inputPattern = /Input #[0-9]+, ([^ ]+),/;
        var durPattern = /Duration\: ([^,]+)/;
        var audioPattern = /Audio\: (.*)/;
        var videoPattern = /Video\: (.*)/;
        if (!("inputStack" in codecsObject)) {
          codecsObject.inputStack = [];
          codecsObject.inputIndex = -1;
          codecsObject.inInput = false;
        }
        var inputStack = codecsObject.inputStack;
        var inputIndex = codecsObject.inputIndex;
        var inInput = codecsObject.inInput;
        var format, dur, audio, video;
        if (format = stderrLine.match(inputPattern)) {
          inInput = codecsObject.inInput = true;
          inputIndex = codecsObject.inputIndex = codecsObject.inputIndex + 1;
          inputStack[inputIndex] = { format: format[1], audio: "", video: "", duration: "" };
        } else if (inInput && (dur = stderrLine.match(durPattern))) {
          inputStack[inputIndex].duration = dur[1];
        } else if (inInput && (audio = stderrLine.match(audioPattern))) {
          audio = audio[1].split(", ");
          inputStack[inputIndex].audio = audio[0];
          inputStack[inputIndex].audio_details = audio;
        } else if (inInput && (video = stderrLine.match(videoPattern))) {
          video = video[1].split(", ");
          inputStack[inputIndex].video = video[0];
          inputStack[inputIndex].video_details = video;
        } else if (/Output #\d+/.test(stderrLine)) {
          inInput = codecsObject.inInput = false;
        } else if (/Stream mapping:|Press (\[q\]|ctrl-c) to stop/.test(stderrLine)) {
          command.emit.apply(command, ["codecData"].concat(inputStack));
          return true;
        }
        return false;
      }, "extractCodecData"),
      /**
       * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
       *
       * @param {FfmpegCommand} command event emitter
       * @param {String} stderrLine ffmpeg stderr data
       * @private
       */
      extractProgress: /* @__PURE__ */ __name(function(command, stderrLine) {
        var progress = parseProgressLine(stderrLine);
        if (progress) {
          var ret = {
            frames: parseInt(progress.frame, 10),
            currentFps: parseInt(progress.fps, 10),
            currentKbps: progress.bitrate ? parseFloat(progress.bitrate.replace("kbits/s", "")) : 0,
            targetSize: parseInt(progress.size || progress.Lsize, 10),
            timemark: progress.time
          };
          if (command._ffprobeData && command._ffprobeData.format && command._ffprobeData.format.duration) {
            var duration = Number(command._ffprobeData.format.duration);
            if (!isNaN(duration))
              ret.percent = utils.timemarkToSeconds(ret.timemark) / duration * 100;
          }
          command.emit("progress", ret);
        }
      }, "extractProgress"),
      /**
       * Extract error message(s) from ffmpeg stderr
       *
       * @param {String} stderr ffmpeg stderr data
       * @return {String}
       * @private
       */
      extractError: /* @__PURE__ */ __name(function(stderr) {
        return stderr.split(nlRegexp).reduce(function(messages, message) {
          if (message.charAt(0) === " " || message.charAt(0) === "[") {
            return [];
          } else {
            messages.push(message);
            return messages;
          }
        }, []).join("\n");
      }, "extractError"),
      /**
       * Creates a line ring buffer object with the following methods:
       * - append(str) : appends a string or buffer
       * - get() : returns the whole string
       * - close() : prevents further append() calls and does a last call to callbacks
       * - callback(cb) : calls cb for each line (incl. those already in the ring)
       *
       * @param {Number} maxLines maximum number of lines to store (<= 0 for unlimited)
       */
      linesRing: /* @__PURE__ */ __name(function(maxLines) {
        var cbs = [];
        var lines = [];
        var current = null;
        var closed = false;
        var max = maxLines - 1;
        function emit(line) {
          cbs.forEach(function(cb) {
            cb(line);
          });
        }
        __name(emit, "emit");
        return {
          callback: /* @__PURE__ */ __name(function(cb) {
            lines.forEach(function(l) {
              cb(l);
            });
            cbs.push(cb);
          }, "callback"),
          append: /* @__PURE__ */ __name(function(str) {
            if (closed) return;
            if (str instanceof Buffer) str = "" + str;
            if (!str || str.length === 0) return;
            var newLines = str.split(nlRegexp);
            if (newLines.length === 1) {
              if (current !== null) {
                current = current + newLines.shift();
              } else {
                current = newLines.shift();
              }
            } else {
              if (current !== null) {
                current = current + newLines.shift();
                emit(current);
                lines.push(current);
              }
              current = newLines.pop();
              newLines.forEach(function(l) {
                emit(l);
                lines.push(l);
              });
              if (max > -1 && lines.length > max) {
                lines.splice(0, lines.length - max);
              }
            }
          }, "append"),
          get: /* @__PURE__ */ __name(function() {
            if (current !== null) {
              return lines.concat([current]).join("\n");
            } else {
              return lines.join("\n");
            }
          }, "get"),
          close: /* @__PURE__ */ __name(function() {
            if (closed) return;
            if (current !== null) {
              emit(current);
              lines.push(current);
              if (max > -1 && lines.length > max) {
                lines.shift();
              }
              current = null;
            }
            closed = true;
          }, "close")
        };
      }, "linesRing")
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/inputs.js
var require_inputs = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/inputs.js"(exports, module) {
    "use strict";
    init_esm();
    var utils = require_utils();
    module.exports = function(proto) {
      proto.mergeAdd = proto.addInput = proto.input = function(source) {
        var isFile = false;
        var isStream = false;
        if (typeof source !== "string") {
          if (!("readable" in source) || !source.readable) {
            throw new Error("Invalid input");
          }
          var hasInputStream = this._inputs.some(function(input) {
            return input.isStream;
          });
          if (hasInputStream) {
            throw new Error("Only one input stream is supported");
          }
          isStream = true;
          source.pause();
        } else {
          var protocol = source.match(/^([a-z]{2,}):/i);
          isFile = !protocol || protocol[0] === "file";
        }
        this._inputs.push(this._currentInput = {
          source,
          isFile,
          isStream,
          options: utils.args()
        });
        return this;
      };
      proto.withInputFormat = proto.inputFormat = proto.fromFormat = function(format) {
        if (!this._currentInput) {
          throw new Error("No input specified");
        }
        this._currentInput.options("-f", format);
        return this;
      };
      proto.withInputFps = proto.withInputFPS = proto.withFpsInput = proto.withFPSInput = proto.inputFPS = proto.inputFps = proto.fpsInput = proto.FPSInput = function(fps) {
        if (!this._currentInput) {
          throw new Error("No input specified");
        }
        this._currentInput.options("-r", fps);
        return this;
      };
      proto.nativeFramerate = proto.withNativeFramerate = proto.native = function() {
        if (!this._currentInput) {
          throw new Error("No input specified");
        }
        this._currentInput.options("-re");
        return this;
      };
      proto.setStartTime = proto.seekInput = function(seek) {
        if (!this._currentInput) {
          throw new Error("No input specified");
        }
        this._currentInput.options("-ss", seek);
        return this;
      };
      proto.loop = function(duration) {
        if (!this._currentInput) {
          throw new Error("No input specified");
        }
        this._currentInput.options("-loop", "1");
        if (typeof duration !== "undefined") {
          this.duration(duration);
        }
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/audio.js
var require_audio = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/audio.js"(exports, module) {
    "use strict";
    init_esm();
    var utils = require_utils();
    module.exports = function(proto) {
      proto.withNoAudio = proto.noAudio = function() {
        this._currentOutput.audio.clear();
        this._currentOutput.audioFilters.clear();
        this._currentOutput.audio("-an");
        return this;
      };
      proto.withAudioCodec = proto.audioCodec = function(codec) {
        this._currentOutput.audio("-acodec", codec);
        return this;
      };
      proto.withAudioBitrate = proto.audioBitrate = function(bitrate) {
        this._currentOutput.audio("-b:a", ("" + bitrate).replace(/k?$/, "k"));
        return this;
      };
      proto.withAudioChannels = proto.audioChannels = function(channels) {
        this._currentOutput.audio("-ac", channels);
        return this;
      };
      proto.withAudioFrequency = proto.audioFrequency = function(freq) {
        this._currentOutput.audio("-ar", freq);
        return this;
      };
      proto.withAudioQuality = proto.audioQuality = function(quality) {
        this._currentOutput.audio("-aq", quality);
        return this;
      };
      proto.withAudioFilter = proto.withAudioFilters = proto.audioFilter = proto.audioFilters = function(filters) {
        if (arguments.length > 1) {
          filters = [].slice.call(arguments);
        }
        if (!Array.isArray(filters)) {
          filters = [filters];
        }
        this._currentOutput.audioFilters(utils.makeFilterStrings(filters));
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/video.js
var require_video = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/video.js"(exports, module) {
    "use strict";
    init_esm();
    var utils = require_utils();
    module.exports = function(proto) {
      proto.withNoVideo = proto.noVideo = function() {
        this._currentOutput.video.clear();
        this._currentOutput.videoFilters.clear();
        this._currentOutput.video("-vn");
        return this;
      };
      proto.withVideoCodec = proto.videoCodec = function(codec) {
        this._currentOutput.video("-vcodec", codec);
        return this;
      };
      proto.withVideoBitrate = proto.videoBitrate = function(bitrate, constant) {
        bitrate = ("" + bitrate).replace(/k?$/, "k");
        this._currentOutput.video("-b:v", bitrate);
        if (constant) {
          this._currentOutput.video(
            "-maxrate",
            bitrate,
            "-minrate",
            bitrate,
            "-bufsize",
            "3M"
          );
        }
        return this;
      };
      proto.withVideoFilter = proto.withVideoFilters = proto.videoFilter = proto.videoFilters = function(filters) {
        if (arguments.length > 1) {
          filters = [].slice.call(arguments);
        }
        if (!Array.isArray(filters)) {
          filters = [filters];
        }
        this._currentOutput.videoFilters(utils.makeFilterStrings(filters));
        return this;
      };
      proto.withOutputFps = proto.withOutputFPS = proto.withFpsOutput = proto.withFPSOutput = proto.withFps = proto.withFPS = proto.outputFPS = proto.outputFps = proto.fpsOutput = proto.FPSOutput = proto.fps = proto.FPS = function(fps) {
        this._currentOutput.video("-r", fps);
        return this;
      };
      proto.takeFrames = proto.withFrames = proto.frames = function(frames) {
        this._currentOutput.video("-vframes", frames);
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/videosize.js
var require_videosize = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/videosize.js"(exports, module) {
    "use strict";
    init_esm();
    function getScalePadFilters(width, height, aspect, color) {
      return [
        /*
          In both cases, we first have to scale the input to match the requested size.
          When using computed width/height, we truncate them to multiples of 2
         */
        {
          filter: "scale",
          options: {
            w: "if(gt(a," + aspect + ")," + width + ",trunc(" + height + "*a/2)*2)",
            h: "if(lt(a," + aspect + ")," + height + ",trunc(" + width + "/a/2)*2)"
          }
        },
        /*
          Then we pad the scaled input to match the target size
          (here iw and ih refer to the padding input, i.e the scaled output)
         */
        {
          filter: "pad",
          options: {
            w: width,
            h: height,
            x: "if(gt(a," + aspect + "),0,(" + width + "-iw)/2)",
            y: "if(lt(a," + aspect + "),0,(" + height + "-ih)/2)",
            color
          }
        }
      ];
    }
    __name(getScalePadFilters, "getScalePadFilters");
    function createSizeFilters(output, key, value) {
      var data = output.sizeData = output.sizeData || {};
      data[key] = value;
      if (!("size" in data)) {
        return [];
      }
      var fixedSize = data.size.match(/([0-9]+)x([0-9]+)/);
      var fixedWidth = data.size.match(/([0-9]+)x\?/);
      var fixedHeight = data.size.match(/\?x([0-9]+)/);
      var percentRatio = data.size.match(/\b([0-9]{1,3})%/);
      var width, height, aspect;
      if (percentRatio) {
        var ratio = Number(percentRatio[1]) / 100;
        return [{
          filter: "scale",
          options: {
            w: "trunc(iw*" + ratio + "/2)*2",
            h: "trunc(ih*" + ratio + "/2)*2"
          }
        }];
      } else if (fixedSize) {
        width = Math.round(Number(fixedSize[1]) / 2) * 2;
        height = Math.round(Number(fixedSize[2]) / 2) * 2;
        aspect = width / height;
        if (data.pad) {
          return getScalePadFilters(width, height, aspect, data.pad);
        } else {
          return [{ filter: "scale", options: { w: width, h: height } }];
        }
      } else if (fixedWidth || fixedHeight) {
        if ("aspect" in data) {
          width = fixedWidth ? fixedWidth[1] : Math.round(Number(fixedHeight[1]) * data.aspect);
          height = fixedHeight ? fixedHeight[1] : Math.round(Number(fixedWidth[1]) / data.aspect);
          width = Math.round(width / 2) * 2;
          height = Math.round(height / 2) * 2;
          if (data.pad) {
            return getScalePadFilters(width, height, data.aspect, data.pad);
          } else {
            return [{ filter: "scale", options: { w: width, h: height } }];
          }
        } else {
          if (fixedWidth) {
            return [{
              filter: "scale",
              options: {
                w: Math.round(Number(fixedWidth[1]) / 2) * 2,
                h: "trunc(ow/a/2)*2"
              }
            }];
          } else {
            return [{
              filter: "scale",
              options: {
                w: "trunc(oh*a/2)*2",
                h: Math.round(Number(fixedHeight[1]) / 2) * 2
              }
            }];
          }
        }
      } else {
        throw new Error("Invalid size specified: " + data.size);
      }
    }
    __name(createSizeFilters, "createSizeFilters");
    module.exports = function(proto) {
      proto.keepPixelAspect = // Only for compatibility, this is not about keeping _pixel_ aspect ratio
      proto.keepDisplayAspect = proto.keepDisplayAspectRatio = proto.keepDAR = function() {
        return this.videoFilters([
          {
            filter: "scale",
            options: {
              w: "if(gt(sar,1),iw*sar,iw)",
              h: "if(lt(sar,1),ih/sar,ih)"
            }
          },
          {
            filter: "setsar",
            options: "1"
          }
        ]);
      };
      proto.withSize = proto.setSize = proto.size = function(size) {
        var filters = createSizeFilters(this._currentOutput, "size", size);
        this._currentOutput.sizeFilters.clear();
        this._currentOutput.sizeFilters(filters);
        return this;
      };
      proto.withAspect = proto.withAspectRatio = proto.setAspect = proto.setAspectRatio = proto.aspect = proto.aspectRatio = function(aspect) {
        var a = Number(aspect);
        if (isNaN(a)) {
          var match = aspect.match(/^(\d+):(\d+)$/);
          if (match) {
            a = Number(match[1]) / Number(match[2]);
          } else {
            throw new Error("Invalid aspect ratio: " + aspect);
          }
        }
        var filters = createSizeFilters(this._currentOutput, "aspect", a);
        this._currentOutput.sizeFilters.clear();
        this._currentOutput.sizeFilters(filters);
        return this;
      };
      proto.applyAutopadding = proto.applyAutoPadding = proto.applyAutopad = proto.applyAutoPad = proto.withAutopadding = proto.withAutoPadding = proto.withAutopad = proto.withAutoPad = proto.autoPad = proto.autopad = function(pad, color) {
        if (typeof pad === "string") {
          color = pad;
          pad = true;
        }
        if (typeof pad === "undefined") {
          pad = true;
        }
        var filters = createSizeFilters(this._currentOutput, "pad", pad ? color || "black" : false);
        this._currentOutput.sizeFilters.clear();
        this._currentOutput.sizeFilters(filters);
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/output.js
var require_output = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/output.js"(exports, module) {
    "use strict";
    init_esm();
    var utils = require_utils();
    module.exports = function(proto) {
      proto.addOutput = proto.output = function(target, pipeopts) {
        var isFile = false;
        if (!target && this._currentOutput) {
          throw new Error("Invalid output");
        }
        if (target && typeof target !== "string") {
          if (!("writable" in target) || !target.writable) {
            throw new Error("Invalid output");
          }
        } else if (typeof target === "string") {
          var protocol = target.match(/^([a-z]{2,}):/i);
          isFile = !protocol || protocol[0] === "file";
        }
        if (target && !("target" in this._currentOutput)) {
          this._currentOutput.target = target;
          this._currentOutput.isFile = isFile;
          this._currentOutput.pipeopts = pipeopts || {};
        } else {
          if (target && typeof target !== "string") {
            var hasOutputStream = this._outputs.some(function(output) {
              return typeof output.target !== "string";
            });
            if (hasOutputStream) {
              throw new Error("Only one output stream is supported");
            }
          }
          this._outputs.push(this._currentOutput = {
            target,
            isFile,
            flags: {},
            pipeopts: pipeopts || {}
          });
          var self = this;
          ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach(function(key) {
            self._currentOutput[key] = utils.args();
          });
          if (!target) {
            delete this._currentOutput.target;
          }
        }
        return this;
      };
      proto.seekOutput = proto.seek = function(seek) {
        this._currentOutput.options("-ss", seek);
        return this;
      };
      proto.withDuration = proto.setDuration = proto.duration = function(duration) {
        this._currentOutput.options("-t", duration);
        return this;
      };
      proto.toFormat = proto.withOutputFormat = proto.outputFormat = proto.format = function(format) {
        this._currentOutput.options("-f", format);
        return this;
      };
      proto.map = function(spec) {
        this._currentOutput.options("-map", spec.replace(utils.streamRegexp, "[$1]"));
        return this;
      };
      proto.updateFlvMetadata = proto.flvmeta = function() {
        this._currentOutput.flags.flvmeta = true;
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/custom.js
var require_custom = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/custom.js"(exports, module) {
    "use strict";
    init_esm();
    var utils = require_utils();
    module.exports = function(proto) {
      proto.addInputOption = proto.addInputOptions = proto.withInputOption = proto.withInputOptions = proto.inputOption = proto.inputOptions = function(options) {
        if (!this._currentInput) {
          throw new Error("No input specified");
        }
        var doSplit = true;
        if (arguments.length > 1) {
          options = [].slice.call(arguments);
          doSplit = false;
        }
        if (!Array.isArray(options)) {
          options = [options];
        }
        this._currentInput.options(options.reduce(function(options2, option) {
          var split = String(option).split(" ");
          if (doSplit && split.length === 2) {
            options2.push(split[0], split[1]);
          } else {
            options2.push(option);
          }
          return options2;
        }, []));
        return this;
      };
      proto.addOutputOption = proto.addOutputOptions = proto.addOption = proto.addOptions = proto.withOutputOption = proto.withOutputOptions = proto.withOption = proto.withOptions = proto.outputOption = proto.outputOptions = function(options) {
        var doSplit = true;
        if (arguments.length > 1) {
          options = [].slice.call(arguments);
          doSplit = false;
        }
        if (!Array.isArray(options)) {
          options = [options];
        }
        this._currentOutput.options(options.reduce(function(options2, option) {
          var split = String(option).split(" ");
          if (doSplit && split.length === 2) {
            options2.push(split[0], split[1]);
          } else {
            options2.push(option);
          }
          return options2;
        }, []));
        return this;
      };
      proto.filterGraph = proto.complexFilter = function(spec, map) {
        this._complexFilters.clear();
        if (!Array.isArray(spec)) {
          spec = [spec];
        }
        this._complexFilters("-filter_complex", utils.makeFilterStrings(spec).join(";"));
        if (Array.isArray(map)) {
          var self = this;
          map.forEach(function(streamSpec) {
            self._complexFilters("-map", streamSpec.replace(utils.streamRegexp, "[$1]"));
          });
        } else if (typeof map === "string") {
          this._complexFilters("-map", map.replace(utils.streamRegexp, "[$1]"));
        }
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/options/misc.js
var require_misc = __commonJS({
  "node_modules/fluent-ffmpeg/lib/options/misc.js"(exports, module) {
    "use strict";
    init_esm();
    var path2 = __require("path");
    module.exports = function(proto) {
      proto.usingPreset = proto.preset = function(preset) {
        if (typeof preset === "function") {
          preset(this);
        } else {
          try {
            var modulePath = path2.join(this.options.presets, preset);
            var module2 = __require(modulePath);
            if (typeof module2.load === "function") {
              module2.load(this);
            } else {
              throw new Error("preset " + modulePath + " has no load() function");
            }
          } catch (err) {
            throw new Error("preset " + modulePath + " could not be loaded: " + err.message);
          }
        }
        return this;
      };
    };
  }
});

// node_modules/async/lib/async.js
var require_async = __commonJS({
  "node_modules/async/lib/async.js"(exports, module) {
    init_esm();
    (function() {
      var async = {};
      var root, previous_async;
      root = this;
      if (root != null) {
        previous_async = root.async;
      }
      async.noConflict = function() {
        root.async = previous_async;
        return async;
      };
      function only_once(fn) {
        var called = false;
        return function() {
          if (called) throw new Error("Callback was already called.");
          called = true;
          fn.apply(root, arguments);
        };
      }
      __name(only_once, "only_once");
      var _each = /* @__PURE__ */ __name(function(arr, iterator) {
        if (arr.forEach) {
          return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
          iterator(arr[i], i, arr);
        }
      }, "_each");
      var _map = /* @__PURE__ */ __name(function(arr, iterator) {
        if (arr.map) {
          return arr.map(iterator);
        }
        var results = [];
        _each(arr, function(x, i, a) {
          results.push(iterator(x, i, a));
        });
        return results;
      }, "_map");
      var _reduce = /* @__PURE__ */ __name(function(arr, iterator, memo) {
        if (arr.reduce) {
          return arr.reduce(iterator, memo);
        }
        _each(arr, function(x, i, a) {
          memo = iterator(memo, x, i, a);
        });
        return memo;
      }, "_reduce");
      var _keys = /* @__PURE__ */ __name(function(obj) {
        if (Object.keys) {
          return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
          if (obj.hasOwnProperty(k)) {
            keys.push(k);
          }
        }
        return keys;
      }, "_keys");
      if (typeof process === "undefined" || !process.nextTick) {
        if (typeof setImmediate === "function") {
          async.nextTick = function(fn) {
            setImmediate(fn);
          };
          async.setImmediate = async.nextTick;
        } else {
          async.nextTick = function(fn) {
            setTimeout(fn, 0);
          };
          async.setImmediate = async.nextTick;
        }
      } else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== "undefined") {
          async.setImmediate = function(fn) {
            setImmediate(fn);
          };
        } else {
          async.setImmediate = async.nextTick;
        }
      }
      async.each = function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length) {
          return callback();
        }
        var completed = 0;
        _each(arr, function(x) {
          iterator(x, only_once(function(err) {
            if (err) {
              callback(err);
              callback = /* @__PURE__ */ __name(function() {
              }, "callback");
            } else {
              completed += 1;
              if (completed >= arr.length) {
                callback(null);
              }
            }
          }));
        });
      };
      async.forEach = async.each;
      async.eachSeries = function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length) {
          return callback();
        }
        var completed = 0;
        var iterate = /* @__PURE__ */ __name(function() {
          iterator(arr[completed], function(err) {
            if (err) {
              callback(err);
              callback = /* @__PURE__ */ __name(function() {
              }, "callback");
            } else {
              completed += 1;
              if (completed >= arr.length) {
                callback(null);
              } else {
                iterate();
              }
            }
          });
        }, "iterate");
        iterate();
      };
      async.forEachSeries = async.eachSeries;
      async.eachLimit = function(arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
      };
      async.forEachLimit = async.eachLimit;
      var _eachLimit = /* @__PURE__ */ __name(function(limit) {
        return function(arr, iterator, callback) {
          callback = callback || function() {
          };
          if (!arr.length || limit <= 0) {
            return callback();
          }
          var completed = 0;
          var started = 0;
          var running = 0;
          (/* @__PURE__ */ __name(function replenish() {
            if (completed >= arr.length) {
              return callback();
            }
            while (running < limit && started < arr.length) {
              started += 1;
              running += 1;
              iterator(arr[started - 1], function(err) {
                if (err) {
                  callback(err);
                  callback = /* @__PURE__ */ __name(function() {
                  }, "callback");
                } else {
                  completed += 1;
                  running -= 1;
                  if (completed >= arr.length) {
                    callback();
                  } else {
                    replenish();
                  }
                }
              });
            }
          }, "replenish"))();
        };
      }, "_eachLimit");
      var doParallel = /* @__PURE__ */ __name(function(fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn.apply(null, [async.each].concat(args));
        };
      }, "doParallel");
      var doParallelLimit = /* @__PURE__ */ __name(function(limit, fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
      }, "doParallelLimit");
      var doSeries = /* @__PURE__ */ __name(function(fn) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn.apply(null, [async.eachSeries].concat(args));
        };
      }, "doSeries");
      var _asyncMap = /* @__PURE__ */ __name(function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(err, v) {
            results[x.index] = v;
            callback2(err);
          });
        }, function(err) {
          callback(err, results);
        });
      }, "_asyncMap");
      async.map = doParallel(_asyncMap);
      async.mapSeries = doSeries(_asyncMap);
      async.mapLimit = function(arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
      };
      var _mapLimit = /* @__PURE__ */ __name(function(limit) {
        return doParallelLimit(limit, _asyncMap);
      }, "_mapLimit");
      async.reduce = function(arr, memo, iterator, callback) {
        async.eachSeries(arr, function(x, callback2) {
          iterator(memo, x, function(err, v) {
            memo = v;
            callback2(err);
          });
        }, function(err) {
          callback(err, memo);
        });
      };
      async.inject = async.reduce;
      async.foldl = async.reduce;
      async.reduceRight = function(arr, memo, iterator, callback) {
        var reversed = _map(arr, function(x) {
          return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
      };
      async.foldr = async.reduceRight;
      var _filter = /* @__PURE__ */ __name(function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(v) {
            if (v) {
              results.push(x);
            }
            callback2();
          });
        }, function(err) {
          callback(_map(results.sort(function(a, b) {
            return a.index - b.index;
          }), function(x) {
            return x.value;
          }));
        });
      }, "_filter");
      async.filter = doParallel(_filter);
      async.filterSeries = doSeries(_filter);
      async.select = async.filter;
      async.selectSeries = async.filterSeries;
      var _reject = /* @__PURE__ */ __name(function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(v) {
            if (!v) {
              results.push(x);
            }
            callback2();
          });
        }, function(err) {
          callback(_map(results.sort(function(a, b) {
            return a.index - b.index;
          }), function(x) {
            return x.value;
          }));
        });
      }, "_reject");
      async.reject = doParallel(_reject);
      async.rejectSeries = doSeries(_reject);
      var _detect = /* @__PURE__ */ __name(function(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function(x, callback) {
          iterator(x, function(result) {
            if (result) {
              main_callback(x);
              main_callback = /* @__PURE__ */ __name(function() {
              }, "main_callback");
            } else {
              callback();
            }
          });
        }, function(err) {
          main_callback();
        });
      }, "_detect");
      async.detect = doParallel(_detect);
      async.detectSeries = doSeries(_detect);
      async.some = function(arr, iterator, main_callback) {
        async.each(arr, function(x, callback) {
          iterator(x, function(v) {
            if (v) {
              main_callback(true);
              main_callback = /* @__PURE__ */ __name(function() {
              }, "main_callback");
            }
            callback();
          });
        }, function(err) {
          main_callback(false);
        });
      };
      async.any = async.some;
      async.every = function(arr, iterator, main_callback) {
        async.each(arr, function(x, callback) {
          iterator(x, function(v) {
            if (!v) {
              main_callback(false);
              main_callback = /* @__PURE__ */ __name(function() {
              }, "main_callback");
            }
            callback();
          });
        }, function(err) {
          main_callback(true);
        });
      };
      async.all = async.every;
      async.sortBy = function(arr, iterator, callback) {
        async.map(arr, function(x, callback2) {
          iterator(x, function(err, criteria) {
            if (err) {
              callback2(err);
            } else {
              callback2(null, { value: x, criteria });
            }
          });
        }, function(err, results) {
          if (err) {
            return callback(err);
          } else {
            var fn = /* @__PURE__ */ __name(function(left, right) {
              var a = left.criteria, b = right.criteria;
              return a < b ? -1 : a > b ? 1 : 0;
            }, "fn");
            callback(null, _map(results.sort(fn), function(x) {
              return x.value;
            }));
          }
        });
      };
      async.auto = function(tasks, callback) {
        callback = callback || function() {
        };
        var keys = _keys(tasks);
        if (!keys.length) {
          return callback(null);
        }
        var results = {};
        var listeners = [];
        var addListener = /* @__PURE__ */ __name(function(fn) {
          listeners.unshift(fn);
        }, "addListener");
        var removeListener = /* @__PURE__ */ __name(function(fn) {
          for (var i = 0; i < listeners.length; i += 1) {
            if (listeners[i] === fn) {
              listeners.splice(i, 1);
              return;
            }
          }
        }, "removeListener");
        var taskComplete = /* @__PURE__ */ __name(function() {
          _each(listeners.slice(0), function(fn) {
            fn();
          });
        }, "taskComplete");
        addListener(function() {
          if (_keys(results).length === keys.length) {
            callback(null, results);
            callback = /* @__PURE__ */ __name(function() {
            }, "callback");
          }
        });
        _each(keys, function(k) {
          var task2 = tasks[k] instanceof Function ? [tasks[k]] : tasks[k];
          var taskCallback = /* @__PURE__ */ __name(function(err) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
              args = args[0];
            }
            if (err) {
              var safeResults = {};
              _each(_keys(results), function(rkey) {
                safeResults[rkey] = results[rkey];
              });
              safeResults[k] = args;
              callback(err, safeResults);
              callback = /* @__PURE__ */ __name(function() {
              }, "callback");
            } else {
              results[k] = args;
              async.setImmediate(taskComplete);
            }
          }, "taskCallback");
          var requires = task2.slice(0, Math.abs(task2.length - 1)) || [];
          var ready = /* @__PURE__ */ __name(function() {
            return _reduce(requires, function(a, x) {
              return a && results.hasOwnProperty(x);
            }, true) && !results.hasOwnProperty(k);
          }, "ready");
          if (ready()) {
            task2[task2.length - 1](taskCallback, results);
          } else {
            var listener = /* @__PURE__ */ __name(function() {
              if (ready()) {
                removeListener(listener);
                task2[task2.length - 1](taskCallback, results);
              }
            }, "listener");
            addListener(listener);
          }
        });
      };
      async.waterfall = function(tasks, callback) {
        callback = callback || function() {
        };
        if (tasks.constructor !== Array) {
          var err = new Error("First argument to waterfall must be an array of functions");
          return callback(err);
        }
        if (!tasks.length) {
          return callback();
        }
        var wrapIterator = /* @__PURE__ */ __name(function(iterator) {
          return function(err2) {
            if (err2) {
              callback.apply(null, arguments);
              callback = /* @__PURE__ */ __name(function() {
              }, "callback");
            } else {
              var args = Array.prototype.slice.call(arguments, 1);
              var next = iterator.next();
              if (next) {
                args.push(wrapIterator(next));
              } else {
                args.push(callback);
              }
              async.setImmediate(function() {
                iterator.apply(null, args);
              });
            }
          };
        }, "wrapIterator");
        wrapIterator(async.iterator(tasks))();
      };
      var _parallel = /* @__PURE__ */ __name(function(eachfn, tasks, callback) {
        callback = callback || function() {
        };
        if (tasks.constructor === Array) {
          eachfn.map(tasks, function(fn, callback2) {
            if (fn) {
              fn(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                  args = args[0];
                }
                callback2.call(null, err, args);
              });
            }
          }, callback);
        } else {
          var results = {};
          eachfn.each(_keys(tasks), function(k, callback2) {
            tasks[k](function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              results[k] = args;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      }, "_parallel");
      async.parallel = function(tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
      };
      async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
      };
      async.series = function(tasks, callback) {
        callback = callback || function() {
        };
        if (tasks.constructor === Array) {
          async.mapSeries(tasks, function(fn, callback2) {
            if (fn) {
              fn(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                  args = args[0];
                }
                callback2.call(null, err, args);
              });
            }
          }, callback);
        } else {
          var results = {};
          async.eachSeries(_keys(tasks), function(k, callback2) {
            tasks[k](function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              results[k] = args;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      };
      async.iterator = function(tasks) {
        var makeCallback = /* @__PURE__ */ __name(function(index) {
          var fn = /* @__PURE__ */ __name(function() {
            if (tasks.length) {
              tasks[index].apply(null, arguments);
            }
            return fn.next();
          }, "fn");
          fn.next = function() {
            return index < tasks.length - 1 ? makeCallback(index + 1) : null;
          };
          return fn;
        }, "makeCallback");
        return makeCallback(0);
      };
      async.apply = function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
          return fn.apply(
            null,
            args.concat(Array.prototype.slice.call(arguments))
          );
        };
      };
      var _concat = /* @__PURE__ */ __name(function(eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function(x, cb) {
          fn(x, function(err, y) {
            r = r.concat(y || []);
            cb(err);
          });
        }, function(err) {
          callback(err, r);
        });
      }, "_concat");
      async.concat = doParallel(_concat);
      async.concatSeries = doSeries(_concat);
      async.whilst = function(test, iterator, callback) {
        if (test()) {
          iterator(function(err) {
            if (err) {
              return callback(err);
            }
            async.whilst(test, iterator, callback);
          });
        } else {
          callback();
        }
      };
      async.doWhilst = function(iterator, test, callback) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          if (test()) {
            async.doWhilst(iterator, test, callback);
          } else {
            callback();
          }
        });
      };
      async.until = function(test, iterator, callback) {
        if (!test()) {
          iterator(function(err) {
            if (err) {
              return callback(err);
            }
            async.until(test, iterator, callback);
          });
        } else {
          callback();
        }
      };
      async.doUntil = function(iterator, test, callback) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          if (!test()) {
            async.doUntil(iterator, test, callback);
          } else {
            callback();
          }
        });
      };
      async.queue = function(worker, concurrency) {
        if (concurrency === void 0) {
          concurrency = 1;
        }
        function _insert(q2, data, pos, callback) {
          if (data.constructor !== Array) {
            data = [data];
          }
          _each(data, function(task2) {
            var item = {
              data: task2,
              callback: typeof callback === "function" ? callback : null
            };
            if (pos) {
              q2.tasks.unshift(item);
            } else {
              q2.tasks.push(item);
            }
            if (q2.saturated && q2.tasks.length === concurrency) {
              q2.saturated();
            }
            async.setImmediate(q2.process);
          });
        }
        __name(_insert, "_insert");
        var workers = 0;
        var q = {
          tasks: [],
          concurrency,
          saturated: null,
          empty: null,
          drain: null,
          push: /* @__PURE__ */ __name(function(data, callback) {
            _insert(q, data, false, callback);
          }, "push"),
          unshift: /* @__PURE__ */ __name(function(data, callback) {
            _insert(q, data, true, callback);
          }, "unshift"),
          process: /* @__PURE__ */ __name(function() {
            if (workers < q.concurrency && q.tasks.length) {
              var task2 = q.tasks.shift();
              if (q.empty && q.tasks.length === 0) {
                q.empty();
              }
              workers += 1;
              var next = /* @__PURE__ */ __name(function() {
                workers -= 1;
                if (task2.callback) {
                  task2.callback.apply(task2, arguments);
                }
                if (q.drain && q.tasks.length + workers === 0) {
                  q.drain();
                }
                q.process();
              }, "next");
              var cb = only_once(next);
              worker(task2.data, cb);
            }
          }, "process"),
          length: /* @__PURE__ */ __name(function() {
            return q.tasks.length;
          }, "length"),
          running: /* @__PURE__ */ __name(function() {
            return workers;
          }, "running")
        };
        return q;
      };
      async.cargo = function(worker, payload) {
        var working = false, tasks = [];
        var cargo = {
          tasks,
          payload,
          saturated: null,
          empty: null,
          drain: null,
          push: /* @__PURE__ */ __name(function(data, callback) {
            if (data.constructor !== Array) {
              data = [data];
            }
            _each(data, function(task2) {
              tasks.push({
                data: task2,
                callback: typeof callback === "function" ? callback : null
              });
              if (cargo.saturated && tasks.length === payload) {
                cargo.saturated();
              }
            });
            async.setImmediate(cargo.process);
          }, "push"),
          process: /* @__PURE__ */ __name(function process2() {
            if (working) return;
            if (tasks.length === 0) {
              if (cargo.drain) cargo.drain();
              return;
            }
            var ts = typeof payload === "number" ? tasks.splice(0, payload) : tasks.splice(0);
            var ds = _map(ts, function(task2) {
              return task2.data;
            });
            if (cargo.empty) cargo.empty();
            working = true;
            worker(ds, function() {
              working = false;
              var args = arguments;
              _each(ts, function(data) {
                if (data.callback) {
                  data.callback.apply(null, args);
                }
              });
              process2();
            });
          }, "process"),
          length: /* @__PURE__ */ __name(function() {
            return tasks.length;
          }, "length"),
          running: /* @__PURE__ */ __name(function() {
            return working;
          }, "running")
        };
        return cargo;
      };
      var _console_fn = /* @__PURE__ */ __name(function(name) {
        return function(fn) {
          var args = Array.prototype.slice.call(arguments, 1);
          fn.apply(null, args.concat([function(err) {
            var args2 = Array.prototype.slice.call(arguments, 1);
            if (typeof console !== "undefined") {
              if (err) {
                if (console.error) {
                  console.error(err);
                }
              } else if (console[name]) {
                _each(args2, function(x) {
                  console[name](x);
                });
              }
            }
          }]));
        };
      }, "_console_fn");
      async.log = _console_fn("log");
      async.dir = _console_fn("dir");
      async.memoize = function(fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function(x) {
          return x;
        };
        var memoized = /* @__PURE__ */ __name(function() {
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          var key = hasher.apply(null, args);
          if (key in memo) {
            callback.apply(null, memo[key]);
          } else if (key in queues) {
            queues[key].push(callback);
          } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([function() {
              memo[key] = arguments;
              var q = queues[key];
              delete queues[key];
              for (var i = 0, l = q.length; i < l; i++) {
                q[i].apply(null, arguments);
              }
            }]));
          }
        }, "memoized");
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
      };
      async.unmemoize = function(fn) {
        return function() {
          return (fn.unmemoized || fn).apply(null, arguments);
        };
      };
      async.times = function(count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
          counter.push(i);
        }
        return async.map(counter, iterator, callback);
      };
      async.timesSeries = function(count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
          counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
      };
      async.compose = function() {
        var fns = Array.prototype.reverse.call(arguments);
        return function() {
          var that = this;
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          async.reduce(
            fns,
            args,
            function(newargs, fn, cb) {
              fn.apply(that, newargs.concat([function() {
                var err = arguments[0];
                var nextargs = Array.prototype.slice.call(arguments, 1);
                cb(err, nextargs);
              }]));
            },
            function(err, results) {
              callback.apply(that, [err].concat(results));
            }
          );
        };
      };
      var _applyEach = /* @__PURE__ */ __name(function(eachfn, fns) {
        var go = /* @__PURE__ */ __name(function() {
          var that = this;
          var args2 = Array.prototype.slice.call(arguments);
          var callback = args2.pop();
          return eachfn(
            fns,
            function(fn, cb) {
              fn.apply(that, args2.concat([cb]));
            },
            callback
          );
        }, "go");
        if (arguments.length > 2) {
          var args = Array.prototype.slice.call(arguments, 2);
          return go.apply(this, args);
        } else {
          return go;
        }
      }, "_applyEach");
      async.applyEach = doParallel(_applyEach);
      async.applyEachSeries = doSeries(_applyEach);
      async.forever = function(fn, callback) {
        function next(err) {
          if (err) {
            if (callback) {
              return callback(err);
            }
            throw err;
          }
          fn(next);
        }
        __name(next, "next");
        next();
      };
      if (typeof define !== "undefined" && define.amd) {
        define([], function() {
          return async;
        });
      } else if (typeof module !== "undefined" && module.exports) {
        module.exports = async;
      } else {
        root.async = async;
      }
    })();
  }
});

// node_modules/fluent-ffmpeg/lib/processor.js
var require_processor = __commonJS({
  "node_modules/fluent-ffmpeg/lib/processor.js"(exports, module) {
    "use strict";
    init_esm();
    var spawn = __require("child_process").spawn;
    var path2 = __require("path");
    var fs2 = __require("fs");
    var async = require_async();
    var utils = require_utils();
    function runFfprobe(command) {
      const inputProbeIndex = 0;
      if (command._inputs[inputProbeIndex].isStream) {
        return;
      }
      command.ffprobe(inputProbeIndex, function(err, data) {
        command._ffprobeData = data;
      });
    }
    __name(runFfprobe, "runFfprobe");
    module.exports = function(proto) {
      proto._spawnFfmpeg = function(args, options, processCB, endCB) {
        if (typeof options === "function") {
          endCB = processCB;
          processCB = options;
          options = {};
        }
        if (typeof endCB === "undefined") {
          endCB = processCB;
          processCB = /* @__PURE__ */ __name(function() {
          }, "processCB");
        }
        var maxLines = "stdoutLines" in options ? options.stdoutLines : this.options.stdoutLines;
        this._getFfmpegPath(function(err, command) {
          if (err) {
            return endCB(err);
          } else if (!command || command.length === 0) {
            return endCB(new Error("Cannot find ffmpeg"));
          }
          if (options.niceness && options.niceness !== 0 && !utils.isWindows) {
            args.unshift("-n", options.niceness, command);
            command = "nice";
          }
          var stdoutRing = utils.linesRing(maxLines);
          var stdoutClosed = false;
          var stderrRing = utils.linesRing(maxLines);
          var stderrClosed = false;
          var ffmpegProc = spawn(command, args, options);
          if (ffmpegProc.stderr) {
            ffmpegProc.stderr.setEncoding("utf8");
          }
          ffmpegProc.on("error", function(err2) {
            endCB(err2);
          });
          var exitError = null;
          function handleExit(err2) {
            if (err2) {
              exitError = err2;
            }
            if (processExited && (stdoutClosed || !options.captureStdout) && stderrClosed) {
              endCB(exitError, stdoutRing, stderrRing);
            }
          }
          __name(handleExit, "handleExit");
          var processExited = false;
          ffmpegProc.on("exit", function(code, signal) {
            processExited = true;
            if (signal) {
              handleExit(new Error("ffmpeg was killed with signal " + signal));
            } else if (code) {
              handleExit(new Error("ffmpeg exited with code " + code));
            } else {
              handleExit();
            }
          });
          if (options.captureStdout) {
            ffmpegProc.stdout.on("data", function(data) {
              stdoutRing.append(data);
            });
            ffmpegProc.stdout.on("close", function() {
              stdoutRing.close();
              stdoutClosed = true;
              handleExit();
            });
          }
          ffmpegProc.stderr.on("data", function(data) {
            stderrRing.append(data);
          });
          ffmpegProc.stderr.on("close", function() {
            stderrRing.close();
            stderrClosed = true;
            handleExit();
          });
          processCB(ffmpegProc, stdoutRing, stderrRing);
        });
      };
      proto._getArguments = function() {
        var complexFilters = this._complexFilters.get();
        var fileOutput = this._outputs.some(function(output) {
          return output.isFile;
        });
        return [].concat(
          // Inputs and input options
          this._inputs.reduce(function(args, input) {
            var source = typeof input.source === "string" ? input.source : "pipe:0";
            return args.concat(
              input.options.get(),
              ["-i", source]
            );
          }, []),
          // Global options
          this._global.get(),
          // Overwrite if we have file outputs
          fileOutput ? ["-y"] : [],
          // Complex filters
          complexFilters,
          // Outputs, filters and output options
          this._outputs.reduce(function(args, output) {
            var sizeFilters = utils.makeFilterStrings(output.sizeFilters.get());
            var audioFilters = output.audioFilters.get();
            var videoFilters = output.videoFilters.get().concat(sizeFilters);
            var outputArg;
            if (!output.target) {
              outputArg = [];
            } else if (typeof output.target === "string") {
              outputArg = [output.target];
            } else {
              outputArg = ["pipe:1"];
            }
            return args.concat(
              output.audio.get(),
              audioFilters.length ? ["-filter:a", audioFilters.join(",")] : [],
              output.video.get(),
              videoFilters.length ? ["-filter:v", videoFilters.join(",")] : [],
              output.options.get(),
              outputArg
            );
          }, [])
        );
      };
      proto._prepare = function(callback, readMetadata) {
        var self = this;
        async.waterfall([
          // Check codecs and formats
          function(cb) {
            self._checkCapabilities(cb);
          },
          // Read metadata if required
          function(cb) {
            if (!readMetadata) {
              return cb();
            }
            self.ffprobe(0, function(err, data) {
              if (!err) {
                self._ffprobeData = data;
              }
              cb();
            });
          },
          // Check for flvtool2/flvmeta if necessary
          function(cb) {
            var flvmeta = self._outputs.some(function(output) {
              if (output.flags.flvmeta && !output.isFile) {
                self.logger.warn("Updating flv metadata is only supported for files");
                output.flags.flvmeta = false;
              }
              return output.flags.flvmeta;
            });
            if (flvmeta) {
              self._getFlvtoolPath(function(err) {
                cb(err);
              });
            } else {
              cb();
            }
          },
          // Build argument list
          function(cb) {
            var args;
            try {
              args = self._getArguments();
            } catch (e) {
              return cb(e);
            }
            cb(null, args);
          },
          // Add "-strict experimental" option where needed
          function(args, cb) {
            self.availableEncoders(function(err, encoders) {
              for (var i = 0; i < args.length; i++) {
                if (args[i] === "-acodec" || args[i] === "-vcodec") {
                  i++;
                  if (args[i] in encoders && encoders[args[i]].experimental) {
                    args.splice(i + 1, 0, "-strict", "experimental");
                    i += 2;
                  }
                }
              }
              cb(null, args);
            });
          }
        ], callback);
        if (!readMetadata) {
          if (this.listeners("progress").length > 0) {
            runFfprobe(this);
          } else {
            this.once("newListener", function(event) {
              if (event === "progress") {
                runFfprobe(this);
              }
            });
          }
        }
      };
      proto.exec = proto.execute = proto.run = function() {
        var self = this;
        var outputPresent = this._outputs.some(function(output) {
          return "target" in output;
        });
        if (!outputPresent) {
          throw new Error("No output specified");
        }
        var outputStream = this._outputs.filter(function(output) {
          return typeof output.target !== "string";
        })[0];
        var inputStream = this._inputs.filter(function(input) {
          return typeof input.source !== "string";
        })[0];
        var ended = false;
        function emitEnd(err, stdout, stderr) {
          if (!ended) {
            ended = true;
            if (err) {
              self.emit("error", err, stdout, stderr);
            } else {
              self.emit("end", stdout, stderr);
            }
          }
        }
        __name(emitEnd, "emitEnd");
        self._prepare(function(err, args) {
          if (err) {
            return emitEnd(err);
          }
          self._spawnFfmpeg(
            args,
            {
              captureStdout: !outputStream,
              niceness: self.options.niceness,
              cwd: self.options.cwd,
              windowsHide: true
            },
            /* @__PURE__ */ __name(function processCB(ffmpegProc, stdoutRing, stderrRing) {
              self.ffmpegProc = ffmpegProc;
              self.emit("start", "ffmpeg " + args.join(" "));
              if (inputStream) {
                inputStream.source.on("error", function(err2) {
                  var reportingErr = new Error("Input stream error: " + err2.message);
                  reportingErr.inputStreamError = err2;
                  emitEnd(reportingErr);
                  ffmpegProc.kill();
                });
                inputStream.source.resume();
                inputStream.source.pipe(ffmpegProc.stdin);
                ffmpegProc.stdin.on("error", function() {
                });
              }
              if (self.options.timeout) {
                self.processTimer = setTimeout(function() {
                  var msg = "process ran into a timeout (" + self.options.timeout + "s)";
                  emitEnd(new Error(msg), stdoutRing.get(), stderrRing.get());
                  ffmpegProc.kill();
                }, self.options.timeout * 1e3);
              }
              if (outputStream) {
                ffmpegProc.stdout.pipe(outputStream.target, outputStream.pipeopts);
                outputStream.target.on("close", function() {
                  self.logger.debug("Output stream closed, scheduling kill for ffmpeg process");
                  setTimeout(function() {
                    emitEnd(new Error("Output stream closed"));
                    ffmpegProc.kill();
                  }, 20);
                });
                outputStream.target.on("error", function(err2) {
                  self.logger.debug("Output stream error, killing ffmpeg process");
                  var reportingErr = new Error("Output stream error: " + err2.message);
                  reportingErr.outputStreamError = err2;
                  emitEnd(reportingErr, stdoutRing.get(), stderrRing.get());
                  ffmpegProc.kill("SIGKILL");
                });
              }
              if (stderrRing) {
                if (self.listeners("stderr").length) {
                  stderrRing.callback(function(line) {
                    self.emit("stderr", line);
                  });
                }
                if (self.listeners("codecData").length) {
                  var codecDataSent = false;
                  var codecObject = {};
                  stderrRing.callback(function(line) {
                    if (!codecDataSent)
                      codecDataSent = utils.extractCodecData(self, line, codecObject);
                  });
                }
                if (self.listeners("progress").length) {
                  stderrRing.callback(function(line) {
                    utils.extractProgress(self, line);
                  });
                }
              }
            }, "processCB"),
            /* @__PURE__ */ __name(function endCB(err2, stdoutRing, stderrRing) {
              clearTimeout(self.processTimer);
              delete self.ffmpegProc;
              if (err2) {
                if (err2.message.match(/ffmpeg exited with code/)) {
                  err2.message += ": " + utils.extractError(stderrRing.get());
                }
                emitEnd(err2, stdoutRing.get(), stderrRing.get());
              } else {
                var flvmeta = self._outputs.filter(function(output) {
                  return output.flags.flvmeta;
                });
                if (flvmeta.length) {
                  self._getFlvtoolPath(function(err3, flvtool) {
                    if (err3) {
                      return emitEnd(err3);
                    }
                    async.each(
                      flvmeta,
                      function(output, cb) {
                        spawn(flvtool, ["-U", output.target], { windowsHide: true }).on("error", function(err4) {
                          cb(new Error("Error running " + flvtool + " on " + output.target + ": " + err4.message));
                        }).on("exit", function(code, signal) {
                          if (code !== 0 || signal) {
                            cb(
                              new Error(flvtool + " " + (signal ? "received signal " + signal : "exited with code " + code)) + " when running on " + output.target
                            );
                          } else {
                            cb();
                          }
                        });
                      },
                      function(err4) {
                        if (err4) {
                          emitEnd(err4);
                        } else {
                          emitEnd(null, stdoutRing.get(), stderrRing.get());
                        }
                      }
                    );
                  });
                } else {
                  emitEnd(null, stdoutRing.get(), stderrRing.get());
                }
              }
            }, "endCB")
          );
        });
        return this;
      };
      proto.renice = function(niceness) {
        if (!utils.isWindows) {
          niceness = niceness || 0;
          if (niceness < -20 || niceness > 20) {
            this.logger.warn("Invalid niceness value: " + niceness + ", must be between -20 and 20");
          }
          niceness = Math.min(20, Math.max(-20, niceness));
          this.options.niceness = niceness;
          if (this.ffmpegProc) {
            var logger = this.logger;
            var pid = this.ffmpegProc.pid;
            var renice = spawn("renice", [niceness, "-p", pid], { windowsHide: true });
            renice.on("error", function(err) {
              logger.warn("could not renice process " + pid + ": " + err.message);
            });
            renice.on("exit", function(code, signal) {
              if (signal) {
                logger.warn("could not renice process " + pid + ": renice was killed by signal " + signal);
              } else if (code) {
                logger.warn("could not renice process " + pid + ": renice exited with " + code);
              } else {
                logger.info("successfully reniced process " + pid + " to " + niceness + " niceness");
              }
            });
          }
        }
        return this;
      };
      proto.kill = function(signal) {
        if (!this.ffmpegProc) {
          this.logger.warn("No running ffmpeg process, cannot send signal");
        } else {
          this.ffmpegProc.kill(signal || "SIGKILL");
        }
        return this;
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/capabilities.js
var require_capabilities = __commonJS({
  "node_modules/fluent-ffmpeg/lib/capabilities.js"(exports, module) {
    "use strict";
    init_esm();
    var fs2 = __require("fs");
    var path2 = __require("path");
    var async = require_async();
    var utils = require_utils();
    var avCodecRegexp = /^\s*([D ])([E ])([VAS])([S ])([D ])([T ]) ([^ ]+) +(.*)$/;
    var ffCodecRegexp = /^\s*([D\.])([E\.])([VAS])([I\.])([L\.])([S\.]) ([^ ]+) +(.*)$/;
    var ffEncodersRegexp = /\(encoders:([^\)]+)\)/;
    var ffDecodersRegexp = /\(decoders:([^\)]+)\)/;
    var encodersRegexp = /^\s*([VAS\.])([F\.])([S\.])([X\.])([B\.])([D\.]) ([^ ]+) +(.*)$/;
    var formatRegexp = /^\s*([D ])([E ])\s+([^ ]+)\s+(.*)$/;
    var lineBreakRegexp = /\r\n|\r|\n/;
    var filterRegexp = /^(?: [T\.][S\.][C\.] )?([^ ]+) +(AA?|VV?|\|)->(AA?|VV?|\|) +(.*)$/;
    var cache = {};
    module.exports = function(proto) {
      proto.setFfmpegPath = function(ffmpegPath) {
        cache.ffmpegPath = ffmpegPath;
        return this;
      };
      proto.setFfprobePath = function(ffprobePath) {
        cache.ffprobePath = ffprobePath;
        return this;
      };
      proto.setFlvtoolPath = function(flvtool) {
        cache.flvtoolPath = flvtool;
        return this;
      };
      proto._forgetPaths = function() {
        delete cache.ffmpegPath;
        delete cache.ffprobePath;
        delete cache.flvtoolPath;
      };
      proto._getFfmpegPath = function(callback) {
        if ("ffmpegPath" in cache) {
          return callback(null, cache.ffmpegPath);
        }
        async.waterfall([
          // Try FFMPEG_PATH
          function(cb) {
            if (process.env.FFMPEG_PATH) {
              fs2.exists(process.env.FFMPEG_PATH, function(exists) {
                if (exists) {
                  cb(null, process.env.FFMPEG_PATH);
                } else {
                  cb(null, "");
                }
              });
            } else {
              cb(null, "");
            }
          },
          // Search in the PATH
          function(ffmpeg2, cb) {
            if (ffmpeg2.length) {
              return cb(null, ffmpeg2);
            }
            utils.which("ffmpeg", function(err, ffmpeg3) {
              cb(err, ffmpeg3);
            });
          }
        ], function(err, ffmpeg2) {
          if (err) {
            callback(err);
          } else {
            callback(null, cache.ffmpegPath = ffmpeg2 || "");
          }
        });
      };
      proto._getFfprobePath = function(callback) {
        var self = this;
        if ("ffprobePath" in cache) {
          return callback(null, cache.ffprobePath);
        }
        async.waterfall([
          // Try FFPROBE_PATH
          function(cb) {
            if (process.env.FFPROBE_PATH) {
              fs2.exists(process.env.FFPROBE_PATH, function(exists) {
                cb(null, exists ? process.env.FFPROBE_PATH : "");
              });
            } else {
              cb(null, "");
            }
          },
          // Search in the PATH
          function(ffprobe, cb) {
            if (ffprobe.length) {
              return cb(null, ffprobe);
            }
            utils.which("ffprobe", function(err, ffprobe2) {
              cb(err, ffprobe2);
            });
          },
          // Search in the same directory as ffmpeg
          function(ffprobe, cb) {
            if (ffprobe.length) {
              return cb(null, ffprobe);
            }
            self._getFfmpegPath(function(err, ffmpeg2) {
              if (err) {
                cb(err);
              } else if (ffmpeg2.length) {
                var name = utils.isWindows ? "ffprobe.exe" : "ffprobe";
                var ffprobe2 = path2.join(path2.dirname(ffmpeg2), name);
                fs2.exists(ffprobe2, function(exists) {
                  cb(null, exists ? ffprobe2 : "");
                });
              } else {
                cb(null, "");
              }
            });
          }
        ], function(err, ffprobe) {
          if (err) {
            callback(err);
          } else {
            callback(null, cache.ffprobePath = ffprobe || "");
          }
        });
      };
      proto._getFlvtoolPath = function(callback) {
        if ("flvtoolPath" in cache) {
          return callback(null, cache.flvtoolPath);
        }
        async.waterfall([
          // Try FLVMETA_PATH
          function(cb) {
            if (process.env.FLVMETA_PATH) {
              fs2.exists(process.env.FLVMETA_PATH, function(exists) {
                cb(null, exists ? process.env.FLVMETA_PATH : "");
              });
            } else {
              cb(null, "");
            }
          },
          // Try FLVTOOL2_PATH
          function(flvtool, cb) {
            if (flvtool.length) {
              return cb(null, flvtool);
            }
            if (process.env.FLVTOOL2_PATH) {
              fs2.exists(process.env.FLVTOOL2_PATH, function(exists) {
                cb(null, exists ? process.env.FLVTOOL2_PATH : "");
              });
            } else {
              cb(null, "");
            }
          },
          // Search for flvmeta in the PATH
          function(flvtool, cb) {
            if (flvtool.length) {
              return cb(null, flvtool);
            }
            utils.which("flvmeta", function(err, flvmeta) {
              cb(err, flvmeta);
            });
          },
          // Search for flvtool2 in the PATH
          function(flvtool, cb) {
            if (flvtool.length) {
              return cb(null, flvtool);
            }
            utils.which("flvtool2", function(err, flvtool2) {
              cb(err, flvtool2);
            });
          }
        ], function(err, flvtool) {
          if (err) {
            callback(err);
          } else {
            callback(null, cache.flvtoolPath = flvtool || "");
          }
        });
      };
      proto.availableFilters = proto.getAvailableFilters = function(callback) {
        if ("filters" in cache) {
          return callback(null, cache.filters);
        }
        this._spawnFfmpeg(["-filters"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
          if (err) {
            return callback(err);
          }
          var stdout = stdoutRing.get();
          var lines = stdout.split("\n");
          var data = {};
          var types = { A: "audio", V: "video", "|": "none" };
          lines.forEach(function(line) {
            var match = line.match(filterRegexp);
            if (match) {
              data[match[1]] = {
                description: match[4],
                input: types[match[2].charAt(0)],
                multipleInputs: match[2].length > 1,
                output: types[match[3].charAt(0)],
                multipleOutputs: match[3].length > 1
              };
            }
          });
          callback(null, cache.filters = data);
        });
      };
      proto.availableCodecs = proto.getAvailableCodecs = function(callback) {
        if ("codecs" in cache) {
          return callback(null, cache.codecs);
        }
        this._spawnFfmpeg(["-codecs"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
          if (err) {
            return callback(err);
          }
          var stdout = stdoutRing.get();
          var lines = stdout.split(lineBreakRegexp);
          var data = {};
          lines.forEach(function(line) {
            var match = line.match(avCodecRegexp);
            if (match && match[7] !== "=") {
              data[match[7]] = {
                type: { "V": "video", "A": "audio", "S": "subtitle" }[match[3]],
                description: match[8],
                canDecode: match[1] === "D",
                canEncode: match[2] === "E",
                drawHorizBand: match[4] === "S",
                directRendering: match[5] === "D",
                weirdFrameTruncation: match[6] === "T"
              };
            }
            match = line.match(ffCodecRegexp);
            if (match && match[7] !== "=") {
              var codecData = data[match[7]] = {
                type: { "V": "video", "A": "audio", "S": "subtitle" }[match[3]],
                description: match[8],
                canDecode: match[1] === "D",
                canEncode: match[2] === "E",
                intraFrameOnly: match[4] === "I",
                isLossy: match[5] === "L",
                isLossless: match[6] === "S"
              };
              var encoders = codecData.description.match(ffEncodersRegexp);
              encoders = encoders ? encoders[1].trim().split(" ") : [];
              var decoders = codecData.description.match(ffDecodersRegexp);
              decoders = decoders ? decoders[1].trim().split(" ") : [];
              if (encoders.length || decoders.length) {
                var coderData = {};
                utils.copy(codecData, coderData);
                delete coderData.canEncode;
                delete coderData.canDecode;
                encoders.forEach(function(name) {
                  data[name] = {};
                  utils.copy(coderData, data[name]);
                  data[name].canEncode = true;
                });
                decoders.forEach(function(name) {
                  if (name in data) {
                    data[name].canDecode = true;
                  } else {
                    data[name] = {};
                    utils.copy(coderData, data[name]);
                    data[name].canDecode = true;
                  }
                });
              }
            }
          });
          callback(null, cache.codecs = data);
        });
      };
      proto.availableEncoders = proto.getAvailableEncoders = function(callback) {
        if ("encoders" in cache) {
          return callback(null, cache.encoders);
        }
        this._spawnFfmpeg(["-encoders"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
          if (err) {
            return callback(err);
          }
          var stdout = stdoutRing.get();
          var lines = stdout.split(lineBreakRegexp);
          var data = {};
          lines.forEach(function(line) {
            var match = line.match(encodersRegexp);
            if (match && match[7] !== "=") {
              data[match[7]] = {
                type: { "V": "video", "A": "audio", "S": "subtitle" }[match[1]],
                description: match[8],
                frameMT: match[2] === "F",
                sliceMT: match[3] === "S",
                experimental: match[4] === "X",
                drawHorizBand: match[5] === "B",
                directRendering: match[6] === "D"
              };
            }
          });
          callback(null, cache.encoders = data);
        });
      };
      proto.availableFormats = proto.getAvailableFormats = function(callback) {
        if ("formats" in cache) {
          return callback(null, cache.formats);
        }
        this._spawnFfmpeg(["-formats"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
          if (err) {
            return callback(err);
          }
          var stdout = stdoutRing.get();
          var lines = stdout.split(lineBreakRegexp);
          var data = {};
          lines.forEach(function(line) {
            var match = line.match(formatRegexp);
            if (match) {
              match[3].split(",").forEach(function(format) {
                if (!(format in data)) {
                  data[format] = {
                    description: match[4],
                    canDemux: false,
                    canMux: false
                  };
                }
                if (match[1] === "D") {
                  data[format].canDemux = true;
                }
                if (match[2] === "E") {
                  data[format].canMux = true;
                }
              });
            }
          });
          callback(null, cache.formats = data);
        });
      };
      proto._checkCapabilities = function(callback) {
        var self = this;
        async.waterfall([
          // Get available formats
          function(cb) {
            self.availableFormats(cb);
          },
          // Check whether specified formats are available
          function(formats, cb) {
            var unavailable;
            unavailable = self._outputs.reduce(function(fmts, output) {
              var format = output.options.find("-f", 1);
              if (format) {
                if (!(format[0] in formats) || !formats[format[0]].canMux) {
                  fmts.push(format);
                }
              }
              return fmts;
            }, []);
            if (unavailable.length === 1) {
              return cb(new Error("Output format " + unavailable[0] + " is not available"));
            } else if (unavailable.length > 1) {
              return cb(new Error("Output formats " + unavailable.join(", ") + " are not available"));
            }
            unavailable = self._inputs.reduce(function(fmts, input) {
              var format = input.options.find("-f", 1);
              if (format) {
                if (!(format[0] in formats) || !formats[format[0]].canDemux) {
                  fmts.push(format[0]);
                }
              }
              return fmts;
            }, []);
            if (unavailable.length === 1) {
              return cb(new Error("Input format " + unavailable[0] + " is not available"));
            } else if (unavailable.length > 1) {
              return cb(new Error("Input formats " + unavailable.join(", ") + " are not available"));
            }
            cb();
          },
          // Get available codecs
          function(cb) {
            self.availableEncoders(cb);
          },
          // Check whether specified codecs are available and add strict experimental options if needed
          function(encoders, cb) {
            var unavailable;
            unavailable = self._outputs.reduce(function(cdcs, output) {
              var acodec = output.audio.find("-acodec", 1);
              if (acodec && acodec[0] !== "copy") {
                if (!(acodec[0] in encoders) || encoders[acodec[0]].type !== "audio") {
                  cdcs.push(acodec[0]);
                }
              }
              return cdcs;
            }, []);
            if (unavailable.length === 1) {
              return cb(new Error("Audio codec " + unavailable[0] + " is not available"));
            } else if (unavailable.length > 1) {
              return cb(new Error("Audio codecs " + unavailable.join(", ") + " are not available"));
            }
            unavailable = self._outputs.reduce(function(cdcs, output) {
              var vcodec = output.video.find("-vcodec", 1);
              if (vcodec && vcodec[0] !== "copy") {
                if (!(vcodec[0] in encoders) || encoders[vcodec[0]].type !== "video") {
                  cdcs.push(vcodec[0]);
                }
              }
              return cdcs;
            }, []);
            if (unavailable.length === 1) {
              return cb(new Error("Video codec " + unavailable[0] + " is not available"));
            } else if (unavailable.length > 1) {
              return cb(new Error("Video codecs " + unavailable.join(", ") + " are not available"));
            }
            cb();
          }
        ], callback);
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/ffprobe.js
var require_ffprobe = __commonJS({
  "node_modules/fluent-ffmpeg/lib/ffprobe.js"(exports, module) {
    "use strict";
    init_esm();
    var spawn = __require("child_process").spawn;
    function legacyTag(key) {
      return key.match(/^TAG:/);
    }
    __name(legacyTag, "legacyTag");
    function legacyDisposition(key) {
      return key.match(/^DISPOSITION:/);
    }
    __name(legacyDisposition, "legacyDisposition");
    function parseFfprobeOutput(out) {
      var lines = out.split(/\r\n|\r|\n/);
      lines = lines.filter(function(line2) {
        return line2.length > 0;
      });
      var data = {
        streams: [],
        format: {},
        chapters: []
      };
      function parseBlock(name) {
        var data2 = {};
        var line2 = lines.shift();
        while (typeof line2 !== "undefined") {
          if (line2.toLowerCase() == "[/" + name + "]") {
            return data2;
          } else if (line2.match(/^\[/)) {
            line2 = lines.shift();
            continue;
          }
          var kv = line2.match(/^([^=]+)=(.*)$/);
          if (kv) {
            if (!kv[1].match(/^TAG:/) && kv[2].match(/^[0-9]+(\.[0-9]+)?$/)) {
              data2[kv[1]] = Number(kv[2]);
            } else {
              data2[kv[1]] = kv[2];
            }
          }
          line2 = lines.shift();
        }
        return data2;
      }
      __name(parseBlock, "parseBlock");
      var line = lines.shift();
      while (typeof line !== "undefined") {
        if (line.match(/^\[stream/i)) {
          var stream = parseBlock("stream");
          data.streams.push(stream);
        } else if (line.match(/^\[chapter/i)) {
          var chapter = parseBlock("chapter");
          data.chapters.push(chapter);
        } else if (line.toLowerCase() === "[format]") {
          data.format = parseBlock("format");
        }
        line = lines.shift();
      }
      return data;
    }
    __name(parseFfprobeOutput, "parseFfprobeOutput");
    module.exports = function(proto) {
      proto.ffprobe = function() {
        var input, index = null, options = [], callback;
        var callback = arguments[arguments.length - 1];
        var ended = false;
        function handleCallback(err, data) {
          if (!ended) {
            ended = true;
            callback(err, data);
          }
        }
        __name(handleCallback, "handleCallback");
        ;
        switch (arguments.length) {
          case 3:
            index = arguments[0];
            options = arguments[1];
            break;
          case 2:
            if (typeof arguments[0] === "number") {
              index = arguments[0];
            } else if (Array.isArray(arguments[0])) {
              options = arguments[0];
            }
            break;
        }
        if (index === null) {
          if (!this._currentInput) {
            return handleCallback(new Error("No input specified"));
          }
          input = this._currentInput;
        } else {
          input = this._inputs[index];
          if (!input) {
            return handleCallback(new Error("Invalid input index"));
          }
        }
        this._getFfprobePath(function(err, path2) {
          if (err) {
            return handleCallback(err);
          } else if (!path2) {
            return handleCallback(new Error("Cannot find ffprobe"));
          }
          var stdout = "";
          var stdoutClosed = false;
          var stderr = "";
          var stderrClosed = false;
          var src = input.isStream ? "pipe:0" : input.source;
          var ffprobe = spawn(path2, ["-show_streams", "-show_format"].concat(options, src), { windowsHide: true });
          if (input.isStream) {
            ffprobe.stdin.on("error", function(err2) {
              if (["ECONNRESET", "EPIPE", "EOF"].indexOf(err2.code) >= 0) {
                return;
              }
              handleCallback(err2);
            });
            ffprobe.stdin.on("close", function() {
              input.source.pause();
              input.source.unpipe(ffprobe.stdin);
            });
            input.source.pipe(ffprobe.stdin);
          }
          ffprobe.on("error", callback);
          var exitError = null;
          function handleExit(err2) {
            if (err2) {
              exitError = err2;
            }
            if (processExited && stdoutClosed && stderrClosed) {
              if (exitError) {
                if (stderr) {
                  exitError.message += "\n" + stderr;
                }
                return handleCallback(exitError);
              }
              var data = parseFfprobeOutput(stdout);
              [data.format].concat(data.streams).forEach(function(target) {
                if (target) {
                  var legacyTagKeys = Object.keys(target).filter(legacyTag);
                  if (legacyTagKeys.length) {
                    target.tags = target.tags || {};
                    legacyTagKeys.forEach(function(tagKey) {
                      target.tags[tagKey.substr(4)] = target[tagKey];
                      delete target[tagKey];
                    });
                  }
                  var legacyDispositionKeys = Object.keys(target).filter(legacyDisposition);
                  if (legacyDispositionKeys.length) {
                    target.disposition = target.disposition || {};
                    legacyDispositionKeys.forEach(function(dispositionKey) {
                      target.disposition[dispositionKey.substr(12)] = target[dispositionKey];
                      delete target[dispositionKey];
                    });
                  }
                }
              });
              handleCallback(null, data);
            }
          }
          __name(handleExit, "handleExit");
          var processExited = false;
          ffprobe.on("exit", function(code, signal) {
            processExited = true;
            if (code) {
              handleExit(new Error("ffprobe exited with code " + code));
            } else if (signal) {
              handleExit(new Error("ffprobe was killed with signal " + signal));
            } else {
              handleExit();
            }
          });
          ffprobe.stdout.on("data", function(data) {
            stdout += data;
          });
          ffprobe.stdout.on("close", function() {
            stdoutClosed = true;
            handleExit();
          });
          ffprobe.stderr.on("data", function(data) {
            stderr += data;
          });
          ffprobe.stderr.on("close", function() {
            stderrClosed = true;
            handleExit();
          });
        });
      };
    };
  }
});

// node_modules/fluent-ffmpeg/lib/recipes.js
var require_recipes = __commonJS({
  "node_modules/fluent-ffmpeg/lib/recipes.js"(exports, module) {
    "use strict";
    init_esm();
    var fs2 = __require("fs");
    var path2 = __require("path");
    var PassThrough = __require("stream").PassThrough;
    var async = require_async();
    var utils = require_utils();
    module.exports = /* @__PURE__ */ __name(function recipes(proto) {
      proto.saveToFile = proto.save = function(output) {
        this.output(output).run();
        return this;
      };
      proto.writeToStream = proto.pipe = proto.stream = function(stream, options) {
        if (stream && !("writable" in stream)) {
          options = stream;
          stream = void 0;
        }
        if (!stream) {
          if (process.version.match(/v0\.8\./)) {
            throw new Error("PassThrough stream is not supported on node v0.8");
          }
          stream = new PassThrough();
        }
        this.output(stream, options).run();
        return stream;
      };
      proto.takeScreenshots = proto.thumbnail = proto.thumbnails = proto.screenshot = proto.screenshots = function(config, folder) {
        var self = this;
        var source = this._currentInput.source;
        config = config || { count: 1 };
        if (typeof config === "number") {
          config = {
            count: config
          };
        }
        if (!("folder" in config)) {
          config.folder = folder || ".";
        }
        if ("timestamps" in config) {
          config.timemarks = config.timestamps;
        }
        if (!("timemarks" in config)) {
          if (!config.count) {
            throw new Error("Cannot take screenshots: neither a count nor a timemark list are specified");
          }
          var interval = 100 / (1 + config.count);
          config.timemarks = [];
          for (var i = 0; i < config.count; i++) {
            config.timemarks.push(interval * (i + 1) + "%");
          }
        }
        if ("size" in config) {
          var fixedSize = config.size.match(/^(\d+)x(\d+)$/);
          var fixedWidth = config.size.match(/^(\d+)x\?$/);
          var fixedHeight = config.size.match(/^\?x(\d+)$/);
          var percentSize = config.size.match(/^(\d+)%$/);
          if (!fixedSize && !fixedWidth && !fixedHeight && !percentSize) {
            throw new Error("Invalid size parameter: " + config.size);
          }
        }
        var metadata;
        function getMetadata(cb) {
          if (metadata) {
            cb(null, metadata);
          } else {
            self.ffprobe(function(err, meta) {
              metadata = meta;
              cb(err, meta);
            });
          }
        }
        __name(getMetadata, "getMetadata");
        async.waterfall([
          // Compute percent timemarks if any
          /* @__PURE__ */ __name(function computeTimemarks(next) {
            if (config.timemarks.some(function(t) {
              return ("" + t).match(/^[\d.]+%$/);
            })) {
              if (typeof source !== "string") {
                return next(new Error("Cannot compute screenshot timemarks with an input stream, please specify fixed timemarks"));
              }
              getMetadata(function(err, meta) {
                if (err) {
                  next(err);
                } else {
                  var vstream = meta.streams.reduce(function(biggest, stream) {
                    if (stream.codec_type === "video" && stream.width * stream.height > biggest.width * biggest.height) {
                      return stream;
                    } else {
                      return biggest;
                    }
                  }, { width: 0, height: 0 });
                  if (vstream.width === 0) {
                    return next(new Error("No video stream in input, cannot take screenshots"));
                  }
                  var duration = Number(vstream.duration);
                  if (isNaN(duration)) {
                    duration = Number(meta.format.duration);
                  }
                  if (isNaN(duration)) {
                    return next(new Error("Could not get input duration, please specify fixed timemarks"));
                  }
                  config.timemarks = config.timemarks.map(function(mark) {
                    if (("" + mark).match(/^([\d.]+)%$/)) {
                      return duration * parseFloat(mark) / 100;
                    } else {
                      return mark;
                    }
                  });
                  next();
                }
              });
            } else {
              next();
            }
          }, "computeTimemarks"),
          // Turn all timemarks into numbers and sort them
          /* @__PURE__ */ __name(function normalizeTimemarks(next) {
            config.timemarks = config.timemarks.map(function(mark) {
              return utils.timemarkToSeconds(mark);
            }).sort(function(a, b) {
              return a - b;
            });
            next();
          }, "normalizeTimemarks"),
          // Add '_%i' to pattern when requesting multiple screenshots and no variable token is present
          /* @__PURE__ */ __name(function fixPattern(next) {
            var pattern = config.filename || "tn.png";
            if (pattern.indexOf(".") === -1) {
              pattern += ".png";
            }
            if (config.timemarks.length > 1 && !pattern.match(/%(s|0*i)/)) {
              var ext = path2.extname(pattern);
              pattern = path2.join(path2.dirname(pattern), path2.basename(pattern, ext) + "_%i" + ext);
            }
            next(null, pattern);
          }, "fixPattern"),
          // Replace filename tokens (%f, %b) in pattern
          /* @__PURE__ */ __name(function replaceFilenameTokens(pattern, next) {
            if (pattern.match(/%[bf]/)) {
              if (typeof source !== "string") {
                return next(new Error("Cannot replace %f or %b when using an input stream"));
              }
              pattern = pattern.replace(/%f/g, path2.basename(source)).replace(/%b/g, path2.basename(source, path2.extname(source)));
            }
            next(null, pattern);
          }, "replaceFilenameTokens"),
          // Compute size if needed
          /* @__PURE__ */ __name(function getSize(pattern, next) {
            if (pattern.match(/%[whr]/)) {
              if (fixedSize) {
                return next(null, pattern, fixedSize[1], fixedSize[2]);
              }
              getMetadata(function(err, meta) {
                if (err) {
                  return next(new Error("Could not determine video resolution to replace %w, %h or %r"));
                }
                var vstream = meta.streams.reduce(function(biggest, stream) {
                  if (stream.codec_type === "video" && stream.width * stream.height > biggest.width * biggest.height) {
                    return stream;
                  } else {
                    return biggest;
                  }
                }, { width: 0, height: 0 });
                if (vstream.width === 0) {
                  return next(new Error("No video stream in input, cannot replace %w, %h or %r"));
                }
                var width = vstream.width;
                var height = vstream.height;
                if (fixedWidth) {
                  height = height * Number(fixedWidth[1]) / width;
                  width = Number(fixedWidth[1]);
                } else if (fixedHeight) {
                  width = width * Number(fixedHeight[1]) / height;
                  height = Number(fixedHeight[1]);
                } else if (percentSize) {
                  width = width * Number(percentSize[1]) / 100;
                  height = height * Number(percentSize[1]) / 100;
                }
                next(null, pattern, Math.round(width / 2) * 2, Math.round(height / 2) * 2);
              });
            } else {
              next(null, pattern, -1, -1);
            }
          }, "getSize"),
          // Replace size tokens (%w, %h, %r) in pattern
          /* @__PURE__ */ __name(function replaceSizeTokens(pattern, width, height, next) {
            pattern = pattern.replace(/%r/g, "%wx%h").replace(/%w/g, width).replace(/%h/g, height);
            next(null, pattern);
          }, "replaceSizeTokens"),
          // Replace variable tokens in pattern (%s, %i) and generate filename list
          /* @__PURE__ */ __name(function replaceVariableTokens(pattern, next) {
            var filenames = config.timemarks.map(function(t, i2) {
              return pattern.replace(/%s/g, utils.timemarkToSeconds(t)).replace(/%(0*)i/g, function(match, padding) {
                var idx = "" + (i2 + 1);
                return padding.substr(0, Math.max(0, padding.length + 1 - idx.length)) + idx;
              });
            });
            self.emit("filenames", filenames);
            next(null, filenames);
          }, "replaceVariableTokens"),
          // Create output directory
          /* @__PURE__ */ __name(function createDirectory(filenames, next) {
            fs2.exists(config.folder, function(exists) {
              if (!exists) {
                fs2.mkdir(config.folder, function(err) {
                  if (err) {
                    next(err);
                  } else {
                    next(null, filenames);
                  }
                });
              } else {
                next(null, filenames);
              }
            });
          }, "createDirectory")
        ], /* @__PURE__ */ __name(function runCommand(err, filenames) {
          if (err) {
            return self.emit("error", err);
          }
          var count = config.timemarks.length;
          var split;
          var filters = [split = {
            filter: "split",
            options: count,
            outputs: []
          }];
          if ("size" in config) {
            self.size(config.size);
            var sizeFilters = self._currentOutput.sizeFilters.get().map(function(f, i3) {
              if (i3 > 0) {
                f.inputs = "size" + (i3 - 1);
              }
              f.outputs = "size" + i3;
              return f;
            });
            split.inputs = "size" + (sizeFilters.length - 1);
            filters = sizeFilters.concat(filters);
            self._currentOutput.sizeFilters.clear();
          }
          var first = 0;
          for (var i2 = 0; i2 < count; i2++) {
            var stream = "screen" + i2;
            split.outputs.push(stream);
            if (i2 === 0) {
              first = config.timemarks[i2];
              self.seekInput(first);
            }
            self.output(path2.join(config.folder, filenames[i2])).frames(1).map(stream);
            if (i2 > 0) {
              self.seek(config.timemarks[i2] - first);
            }
          }
          self.complexFilter(filters);
          self.run();
        }, "runCommand"));
        return this;
      };
      proto.mergeToFile = proto.concatenate = proto.concat = function(target, options) {
        var fileInput = this._inputs.filter(function(input) {
          return !input.isStream;
        })[0];
        var self = this;
        this.ffprobe(this._inputs.indexOf(fileInput), function(err, data) {
          if (err) {
            return self.emit("error", err);
          }
          var hasAudioStreams = data.streams.some(function(stream) {
            return stream.codec_type === "audio";
          });
          var hasVideoStreams = data.streams.some(function(stream) {
            return stream.codec_type === "video";
          });
          self.output(target, options).complexFilter({
            filter: "concat",
            options: {
              n: self._inputs.length,
              v: hasVideoStreams ? 1 : 0,
              a: hasAudioStreams ? 1 : 0
            }
          }).run();
        });
        return this;
      };
    }, "recipes");
  }
});

// node_modules/fluent-ffmpeg/lib/fluent-ffmpeg.js
var require_fluent_ffmpeg = __commonJS({
  "node_modules/fluent-ffmpeg/lib/fluent-ffmpeg.js"(exports, module) {
    "use strict";
    init_esm();
    var path2 = __require("path");
    var util = __require("util");
    var EventEmitter = __require("events").EventEmitter;
    var utils = require_utils();
    function FfmpegCommand(input, options) {
      if (!(this instanceof FfmpegCommand)) {
        return new FfmpegCommand(input, options);
      }
      EventEmitter.call(this);
      if (typeof input === "object" && !("readable" in input)) {
        options = input;
      } else {
        options = options || {};
        options.source = input;
      }
      this._inputs = [];
      if (options.source) {
        this.input(options.source);
      }
      this._outputs = [];
      this.output();
      var self = this;
      ["_global", "_complexFilters"].forEach(function(prop) {
        self[prop] = utils.args();
      });
      options.stdoutLines = "stdoutLines" in options ? options.stdoutLines : 100;
      options.presets = options.presets || options.preset || path2.join(__dirname, "presets");
      options.niceness = options.niceness || options.priority || 0;
      this.options = options;
      this.logger = options.logger || {
        debug: /* @__PURE__ */ __name(function() {
        }, "debug"),
        info: /* @__PURE__ */ __name(function() {
        }, "info"),
        warn: /* @__PURE__ */ __name(function() {
        }, "warn"),
        error: /* @__PURE__ */ __name(function() {
        }, "error")
      };
    }
    __name(FfmpegCommand, "FfmpegCommand");
    util.inherits(FfmpegCommand, EventEmitter);
    module.exports = FfmpegCommand;
    FfmpegCommand.prototype.clone = function() {
      var clone = new FfmpegCommand();
      var self = this;
      clone.options = this.options;
      clone.logger = this.logger;
      clone._inputs = this._inputs.map(function(input) {
        return {
          source: input.source,
          options: input.options.clone()
        };
      });
      if ("target" in this._outputs[0]) {
        clone._outputs = [];
        clone.output();
      } else {
        clone._outputs = [
          clone._currentOutput = {
            flags: {}
          }
        ];
        ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach(function(key) {
          clone._currentOutput[key] = self._currentOutput[key].clone();
        });
        if (this._currentOutput.sizeData) {
          clone._currentOutput.sizeData = {};
          utils.copy(this._currentOutput.sizeData, clone._currentOutput.sizeData);
        }
        utils.copy(this._currentOutput.flags, clone._currentOutput.flags);
      }
      ["_global", "_complexFilters"].forEach(function(prop) {
        clone[prop] = self[prop].clone();
      });
      return clone;
    };
    require_inputs()(FfmpegCommand.prototype);
    require_audio()(FfmpegCommand.prototype);
    require_video()(FfmpegCommand.prototype);
    require_videosize()(FfmpegCommand.prototype);
    require_output()(FfmpegCommand.prototype);
    require_custom()(FfmpegCommand.prototype);
    require_misc()(FfmpegCommand.prototype);
    require_processor()(FfmpegCommand.prototype);
    require_capabilities()(FfmpegCommand.prototype);
    FfmpegCommand.setFfmpegPath = function(path3) {
      new FfmpegCommand().setFfmpegPath(path3);
    };
    FfmpegCommand.setFfprobePath = function(path3) {
      new FfmpegCommand().setFfprobePath(path3);
    };
    FfmpegCommand.setFlvtoolPath = function(path3) {
      new FfmpegCommand().setFlvtoolPath(path3);
    };
    FfmpegCommand.availableFilters = FfmpegCommand.getAvailableFilters = function(callback) {
      new FfmpegCommand().availableFilters(callback);
    };
    FfmpegCommand.availableCodecs = FfmpegCommand.getAvailableCodecs = function(callback) {
      new FfmpegCommand().availableCodecs(callback);
    };
    FfmpegCommand.availableFormats = FfmpegCommand.getAvailableFormats = function(callback) {
      new FfmpegCommand().availableFormats(callback);
    };
    FfmpegCommand.availableEncoders = FfmpegCommand.getAvailableEncoders = function(callback) {
      new FfmpegCommand().availableEncoders(callback);
    };
    require_ffprobe()(FfmpegCommand.prototype);
    FfmpegCommand.ffprobe = function(file) {
      var instance = new FfmpegCommand(file);
      instance.ffprobe.apply(instance, Array.prototype.slice.call(arguments, 1));
    };
    require_recipes()(FfmpegCommand.prototype);
  }
});

// node_modules/fluent-ffmpeg/index.js
var require_fluent_ffmpeg2 = __commonJS({
  "node_modules/fluent-ffmpeg/index.js"(exports, module) {
    init_esm();
    module.exports = require_fluent_ffmpeg();
  }
});

// node_modules/@ffmpeg-installer/ffmpeg/lib/verify-file.js
var require_verify_file = __commonJS({
  "node_modules/@ffmpeg-installer/ffmpeg/lib/verify-file.js"(exports, module) {
    init_esm();
    var fs2 = __require("fs");
    function verifyFile(file) {
      try {
        var stats = fs2.statSync(file);
        return stats.isFile();
      } catch (ignored) {
        return false;
      }
    }
    __name(verifyFile, "verifyFile");
    module.exports = verifyFile;
  }
});

// node_modules/@ffmpeg-installer/ffmpeg/package.json
var require_package = __commonJS({
  "node_modules/@ffmpeg-installer/ffmpeg/package.json"(exports, module) {
    module.exports = {
      name: "@ffmpeg-installer/ffmpeg",
      version: "1.1.0",
      main: "index.js",
      scripts: {
        lint: "jshint *.js",
        preversion: "npm run lint",
        types: "tsc",
        preupload: "npm run types",
        upload: "npm --userconfig=.npmrc publish --access public",
        test: "tsd"
      },
      types: "types/index.d.ts",
      keywords: [
        "ffmpeg",
        "binary",
        "installer",
        "audio",
        "sound"
      ],
      author: "Kristoffer Lundén <kristoffer.lunden@gmail.com>",
      license: "LGPL-2.1",
      description: "Platform independent binary installer of FFmpeg for node projects",
      optionalDependencies: {
        "@ffmpeg-installer/darwin-arm64": "4.1.5",
        "@ffmpeg-installer/darwin-x64": "4.1.0",
        "@ffmpeg-installer/linux-arm": "4.1.3",
        "@ffmpeg-installer/linux-arm64": "4.1.4",
        "@ffmpeg-installer/linux-ia32": "4.1.0",
        "@ffmpeg-installer/linux-x64": "4.1.0",
        "@ffmpeg-installer/win32-ia32": "4.1.0",
        "@ffmpeg-installer/win32-x64": "4.1.0"
      },
      devDependencies: {
        jshint: "^2.9.3",
        tsd: "^0.14.0",
        typescript: "^4.2.3"
      },
      repository: {
        type: "git",
        url: "git+https://github.com/kribblo/node-ffmpeg-installer.git"
      },
      bugs: {
        url: "https://github.com/kribblo/node-ffmpeg-installer/issues"
      },
      homepage: "https://github.com/kribblo/node-ffmpeg-installer#readme"
    };
  }
});

// node_modules/@ffmpeg-installer/ffmpeg/index.js
var require_ffmpeg = __commonJS({
  "node_modules/@ffmpeg-installer/ffmpeg/index.js"(exports, module) {
    "use strict";
    init_esm();
    var os2 = __require("os");
    var path2 = __require("path");
    var verifyFile = require_verify_file();
    var platform = os2.platform() + "-" + os2.arch();
    var packageName = "@ffmpeg-installer/" + platform;
    if (!require_package().optionalDependencies[packageName]) {
      throw "Unsupported platform/architecture: " + platform;
    }
    var binary = os2.platform() === "win32" ? "ffmpeg.exe" : "ffmpeg";
    var topLevelPath = path2.resolve(__dirname.substr(0, __dirname.indexOf("node_modules")), "node_modules", "@ffmpeg-installer", platform);
    var npm3Path = path2.resolve(__dirname, "..", platform);
    var npm2Path = path2.resolve(__dirname, "node_modules", "@ffmpeg-installer", platform);
    var topLevelBinary = path2.join(topLevelPath, binary);
    var npm3Binary = path2.join(npm3Path, binary);
    var npm2Binary = path2.join(npm2Path, binary);
    var topLevelPackage = path2.join(topLevelPath, "package.json");
    var npm3Package = path2.join(npm3Path, "package.json");
    var npm2Package = path2.join(npm2Path, "package.json");
    var ffmpegPath;
    var packageJson;
    if (verifyFile(npm3Binary)) {
      ffmpegPath = npm3Binary;
      packageJson = __require(npm3Package);
    } else if (verifyFile(npm2Binary)) {
      ffmpegPath = npm2Binary;
      packageJson = __require(npm2Package);
    } else if (verifyFile(topLevelBinary)) {
      ffmpegPath = topLevelBinary;
      packageJson = __require(topLevelPackage);
    } else {
      throw 'Could not find ffmpeg executable, tried "' + npm3Binary + '", "' + npm2Binary + '" and "' + topLevelBinary + '"';
    }
    var version = packageJson.ffmpeg || packageJson.version;
    var url = packageJson.homepage;
    module.exports = {
      path: ffmpegPath,
      version,
      url
    };
  }
});

// trigger/workflow-nodes.ts
init_esm();

// node_modules/@google/generative-ai/dist/index.mjs
init_esm();
var SchemaType;
(function(SchemaType2) {
  SchemaType2["STRING"] = "string";
  SchemaType2["NUMBER"] = "number";
  SchemaType2["INTEGER"] = "integer";
  SchemaType2["BOOLEAN"] = "boolean";
  SchemaType2["ARRAY"] = "array";
  SchemaType2["OBJECT"] = "object";
})(SchemaType || (SchemaType = {}));
var ExecutableCodeLanguage;
(function(ExecutableCodeLanguage2) {
  ExecutableCodeLanguage2["LANGUAGE_UNSPECIFIED"] = "language_unspecified";
  ExecutableCodeLanguage2["PYTHON"] = "python";
})(ExecutableCodeLanguage || (ExecutableCodeLanguage = {}));
var Outcome;
(function(Outcome2) {
  Outcome2["OUTCOME_UNSPECIFIED"] = "outcome_unspecified";
  Outcome2["OUTCOME_OK"] = "outcome_ok";
  Outcome2["OUTCOME_FAILED"] = "outcome_failed";
  Outcome2["OUTCOME_DEADLINE_EXCEEDED"] = "outcome_deadline_exceeded";
})(Outcome || (Outcome = {}));
var POSSIBLE_ROLES = ["user", "model", "function", "system"];
var HarmCategory;
(function(HarmCategory2) {
  HarmCategory2["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
  HarmCategory2["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
  HarmCategory2["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
  HarmCategory2["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
  HarmCategory2["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
  HarmCategory2["HARM_CATEGORY_CIVIC_INTEGRITY"] = "HARM_CATEGORY_CIVIC_INTEGRITY";
})(HarmCategory || (HarmCategory = {}));
var HarmBlockThreshold;
(function(HarmBlockThreshold2) {
  HarmBlockThreshold2["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
  HarmBlockThreshold2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
  HarmBlockThreshold2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
  HarmBlockThreshold2["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
  HarmBlockThreshold2["BLOCK_NONE"] = "BLOCK_NONE";
})(HarmBlockThreshold || (HarmBlockThreshold = {}));
var HarmProbability;
(function(HarmProbability2) {
  HarmProbability2["HARM_PROBABILITY_UNSPECIFIED"] = "HARM_PROBABILITY_UNSPECIFIED";
  HarmProbability2["NEGLIGIBLE"] = "NEGLIGIBLE";
  HarmProbability2["LOW"] = "LOW";
  HarmProbability2["MEDIUM"] = "MEDIUM";
  HarmProbability2["HIGH"] = "HIGH";
})(HarmProbability || (HarmProbability = {}));
var BlockReason;
(function(BlockReason2) {
  BlockReason2["BLOCKED_REASON_UNSPECIFIED"] = "BLOCKED_REASON_UNSPECIFIED";
  BlockReason2["SAFETY"] = "SAFETY";
  BlockReason2["OTHER"] = "OTHER";
})(BlockReason || (BlockReason = {}));
var FinishReason;
(function(FinishReason2) {
  FinishReason2["FINISH_REASON_UNSPECIFIED"] = "FINISH_REASON_UNSPECIFIED";
  FinishReason2["STOP"] = "STOP";
  FinishReason2["MAX_TOKENS"] = "MAX_TOKENS";
  FinishReason2["SAFETY"] = "SAFETY";
  FinishReason2["RECITATION"] = "RECITATION";
  FinishReason2["LANGUAGE"] = "LANGUAGE";
  FinishReason2["BLOCKLIST"] = "BLOCKLIST";
  FinishReason2["PROHIBITED_CONTENT"] = "PROHIBITED_CONTENT";
  FinishReason2["SPII"] = "SPII";
  FinishReason2["MALFORMED_FUNCTION_CALL"] = "MALFORMED_FUNCTION_CALL";
  FinishReason2["OTHER"] = "OTHER";
})(FinishReason || (FinishReason = {}));
var TaskType;
(function(TaskType2) {
  TaskType2["TASK_TYPE_UNSPECIFIED"] = "TASK_TYPE_UNSPECIFIED";
  TaskType2["RETRIEVAL_QUERY"] = "RETRIEVAL_QUERY";
  TaskType2["RETRIEVAL_DOCUMENT"] = "RETRIEVAL_DOCUMENT";
  TaskType2["SEMANTIC_SIMILARITY"] = "SEMANTIC_SIMILARITY";
  TaskType2["CLASSIFICATION"] = "CLASSIFICATION";
  TaskType2["CLUSTERING"] = "CLUSTERING";
})(TaskType || (TaskType = {}));
var FunctionCallingMode;
(function(FunctionCallingMode2) {
  FunctionCallingMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
  FunctionCallingMode2["AUTO"] = "AUTO";
  FunctionCallingMode2["ANY"] = "ANY";
  FunctionCallingMode2["NONE"] = "NONE";
})(FunctionCallingMode || (FunctionCallingMode = {}));
var DynamicRetrievalMode;
(function(DynamicRetrievalMode2) {
  DynamicRetrievalMode2["MODE_UNSPECIFIED"] = "MODE_UNSPECIFIED";
  DynamicRetrievalMode2["MODE_DYNAMIC"] = "MODE_DYNAMIC";
})(DynamicRetrievalMode || (DynamicRetrievalMode = {}));
var GoogleGenerativeAIError = class extends Error {
  static {
    __name(this, "GoogleGenerativeAIError");
  }
  constructor(message) {
    super(`[GoogleGenerativeAI Error]: ${message}`);
  }
};
var GoogleGenerativeAIResponseError = class extends GoogleGenerativeAIError {
  static {
    __name(this, "GoogleGenerativeAIResponseError");
  }
  constructor(message, response) {
    super(message);
    this.response = response;
  }
};
var GoogleGenerativeAIFetchError = class extends GoogleGenerativeAIError {
  static {
    __name(this, "GoogleGenerativeAIFetchError");
  }
  constructor(message, status, statusText, errorDetails) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.errorDetails = errorDetails;
  }
};
var GoogleGenerativeAIRequestInputError = class extends GoogleGenerativeAIError {
  static {
    __name(this, "GoogleGenerativeAIRequestInputError");
  }
};
var GoogleGenerativeAIAbortError = class extends GoogleGenerativeAIError {
  static {
    __name(this, "GoogleGenerativeAIAbortError");
  }
};
var DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com";
var DEFAULT_API_VERSION = "v1beta";
var PACKAGE_VERSION = "0.24.1";
var PACKAGE_LOG_HEADER = "genai-js";
var Task;
(function(Task2) {
  Task2["GENERATE_CONTENT"] = "generateContent";
  Task2["STREAM_GENERATE_CONTENT"] = "streamGenerateContent";
  Task2["COUNT_TOKENS"] = "countTokens";
  Task2["EMBED_CONTENT"] = "embedContent";
  Task2["BATCH_EMBED_CONTENTS"] = "batchEmbedContents";
})(Task || (Task = {}));
var RequestUrl = class {
  static {
    __name(this, "RequestUrl");
  }
  constructor(model, task2, apiKey, stream, requestOptions) {
    this.model = model;
    this.task = task2;
    this.apiKey = apiKey;
    this.stream = stream;
    this.requestOptions = requestOptions;
  }
  toString() {
    var _a, _b;
    const apiVersion = ((_a = this.requestOptions) === null || _a === void 0 ? void 0 : _a.apiVersion) || DEFAULT_API_VERSION;
    const baseUrl = ((_b = this.requestOptions) === null || _b === void 0 ? void 0 : _b.baseUrl) || DEFAULT_BASE_URL;
    let url = `${baseUrl}/${apiVersion}/${this.model}:${this.task}`;
    if (this.stream) {
      url += "?alt=sse";
    }
    return url;
  }
};
function getClientHeaders(requestOptions) {
  const clientHeaders = [];
  if (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.apiClient) {
    clientHeaders.push(requestOptions.apiClient);
  }
  clientHeaders.push(`${PACKAGE_LOG_HEADER}/${PACKAGE_VERSION}`);
  return clientHeaders.join(" ");
}
__name(getClientHeaders, "getClientHeaders");
async function getHeaders(url) {
  var _a;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("x-goog-api-client", getClientHeaders(url.requestOptions));
  headers.append("x-goog-api-key", url.apiKey);
  let customHeaders = (_a = url.requestOptions) === null || _a === void 0 ? void 0 : _a.customHeaders;
  if (customHeaders) {
    if (!(customHeaders instanceof Headers)) {
      try {
        customHeaders = new Headers(customHeaders);
      } catch (e) {
        throw new GoogleGenerativeAIRequestInputError(`unable to convert customHeaders value ${JSON.stringify(customHeaders)} to Headers: ${e.message}`);
      }
    }
    for (const [headerName, headerValue] of customHeaders.entries()) {
      if (headerName === "x-goog-api-key") {
        throw new GoogleGenerativeAIRequestInputError(`Cannot set reserved header name ${headerName}`);
      } else if (headerName === "x-goog-api-client") {
        throw new GoogleGenerativeAIRequestInputError(`Header name ${headerName} can only be set using the apiClient field`);
      }
      headers.append(headerName, headerValue);
    }
  }
  return headers;
}
__name(getHeaders, "getHeaders");
async function constructModelRequest(model, task2, apiKey, stream, body, requestOptions) {
  const url = new RequestUrl(model, task2, apiKey, stream, requestOptions);
  return {
    url: url.toString(),
    fetchOptions: Object.assign(Object.assign({}, buildFetchOptions(requestOptions)), { method: "POST", headers: await getHeaders(url), body })
  };
}
__name(constructModelRequest, "constructModelRequest");
async function makeModelRequest(model, task2, apiKey, stream, body, requestOptions = {}, fetchFn = fetch) {
  const { url, fetchOptions } = await constructModelRequest(model, task2, apiKey, stream, body, requestOptions);
  return makeRequest(url, fetchOptions, fetchFn);
}
__name(makeModelRequest, "makeModelRequest");
async function makeRequest(url, fetchOptions, fetchFn = fetch) {
  let response;
  try {
    response = await fetchFn(url, fetchOptions);
  } catch (e) {
    handleResponseError(e, url);
  }
  if (!response.ok) {
    await handleResponseNotOk(response, url);
  }
  return response;
}
__name(makeRequest, "makeRequest");
function handleResponseError(e, url) {
  let err = e;
  if (err.name === "AbortError") {
    err = new GoogleGenerativeAIAbortError(`Request aborted when fetching ${url.toString()}: ${e.message}`);
    err.stack = e.stack;
  } else if (!(e instanceof GoogleGenerativeAIFetchError || e instanceof GoogleGenerativeAIRequestInputError)) {
    err = new GoogleGenerativeAIError(`Error fetching from ${url.toString()}: ${e.message}`);
    err.stack = e.stack;
  }
  throw err;
}
__name(handleResponseError, "handleResponseError");
async function handleResponseNotOk(response, url) {
  let message = "";
  let errorDetails;
  try {
    const json = await response.json();
    message = json.error.message;
    if (json.error.details) {
      message += ` ${JSON.stringify(json.error.details)}`;
      errorDetails = json.error.details;
    }
  } catch (e) {
  }
  throw new GoogleGenerativeAIFetchError(`Error fetching from ${url.toString()}: [${response.status} ${response.statusText}] ${message}`, response.status, response.statusText, errorDetails);
}
__name(handleResponseNotOk, "handleResponseNotOk");
function buildFetchOptions(requestOptions) {
  const fetchOptions = {};
  if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.signal) !== void 0 || (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) >= 0) {
    const controller = new AbortController();
    if ((requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.timeout) >= 0) {
      setTimeout(() => controller.abort(), requestOptions.timeout);
    }
    if (requestOptions === null || requestOptions === void 0 ? void 0 : requestOptions.signal) {
      requestOptions.signal.addEventListener("abort", () => {
        controller.abort();
      });
    }
    fetchOptions.signal = controller.signal;
  }
  return fetchOptions;
}
__name(buildFetchOptions, "buildFetchOptions");
function addHelpers(response) {
  response.text = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(`This response had ${response.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`);
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
      }
      return getText(response);
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError(`Text not available. ${formatBlockErrorMessage(response)}`, response);
    }
    return "";
  };
  response.functionCall = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(`This response had ${response.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`);
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
      }
      console.warn(`response.functionCall() is deprecated. Use response.functionCalls() instead.`);
      return getFunctionCalls(response)[0];
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
    }
    return void 0;
  };
  response.functionCalls = () => {
    if (response.candidates && response.candidates.length > 0) {
      if (response.candidates.length > 1) {
        console.warn(`This response had ${response.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`);
      }
      if (hadBadFinishReason(response.candidates[0])) {
        throw new GoogleGenerativeAIResponseError(`${formatBlockErrorMessage(response)}`, response);
      }
      return getFunctionCalls(response);
    } else if (response.promptFeedback) {
      throw new GoogleGenerativeAIResponseError(`Function call not available. ${formatBlockErrorMessage(response)}`, response);
    }
    return void 0;
  };
  return response;
}
__name(addHelpers, "addHelpers");
function getText(response) {
  var _a, _b, _c, _d;
  const textStrings = [];
  if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
    for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts) {
      if (part.text) {
        textStrings.push(part.text);
      }
      if (part.executableCode) {
        textStrings.push("\n```" + part.executableCode.language + "\n" + part.executableCode.code + "\n```\n");
      }
      if (part.codeExecutionResult) {
        textStrings.push("\n```\n" + part.codeExecutionResult.output + "\n```\n");
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join("");
  } else {
    return "";
  }
}
__name(getText, "getText");
function getFunctionCalls(response) {
  var _a, _b, _c, _d;
  const functionCalls = [];
  if ((_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0].content) === null || _b === void 0 ? void 0 : _b.parts) {
    for (const part of (_d = (_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0].content) === null || _d === void 0 ? void 0 : _d.parts) {
      if (part.functionCall) {
        functionCalls.push(part.functionCall);
      }
    }
  }
  if (functionCalls.length > 0) {
    return functionCalls;
  } else {
    return void 0;
  }
}
__name(getFunctionCalls, "getFunctionCalls");
var badFinishReasons = [
  FinishReason.RECITATION,
  FinishReason.SAFETY,
  FinishReason.LANGUAGE
];
function hadBadFinishReason(candidate) {
  return !!candidate.finishReason && badFinishReasons.includes(candidate.finishReason);
}
__name(hadBadFinishReason, "hadBadFinishReason");
function formatBlockErrorMessage(response) {
  var _a, _b, _c;
  let message = "";
  if ((!response.candidates || response.candidates.length === 0) && response.promptFeedback) {
    message += "Response was blocked";
    if ((_a = response.promptFeedback) === null || _a === void 0 ? void 0 : _a.blockReason) {
      message += ` due to ${response.promptFeedback.blockReason}`;
    }
    if ((_b = response.promptFeedback) === null || _b === void 0 ? void 0 : _b.blockReasonMessage) {
      message += `: ${response.promptFeedback.blockReasonMessage}`;
    }
  } else if ((_c = response.candidates) === null || _c === void 0 ? void 0 : _c[0]) {
    const firstCandidate = response.candidates[0];
    if (hadBadFinishReason(firstCandidate)) {
      message += `Candidate was blocked due to ${firstCandidate.finishReason}`;
      if (firstCandidate.finishMessage) {
        message += `: ${firstCandidate.finishMessage}`;
      }
    }
  }
  return message;
}
__name(formatBlockErrorMessage, "formatBlockErrorMessage");
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
__name(__await, "__await");
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function verb(n) {
    if (g[n]) i[n] = function(v) {
      return new Promise(function(a, b) {
        q.push([n, v, a, b]) > 1 || resume(n, v);
      });
    };
  }
  __name(verb, "verb");
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  __name(resume, "resume");
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  __name(step, "step");
  function fulfill(value) {
    resume("next", value);
  }
  __name(fulfill, "fulfill");
  function reject(value) {
    resume("throw", value);
  }
  __name(reject, "reject");
  function settle(f, v) {
    if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
  }
  __name(settle, "settle");
}
__name(__asyncGenerator, "__asyncGenerator");
var responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;
function processStream(response) {
  const inputStream = response.body.pipeThrough(new TextDecoderStream("utf8", { fatal: true }));
  const responseStream = getResponseStream(inputStream);
  const [stream1, stream2] = responseStream.tee();
  return {
    stream: generateResponseSequence(stream1),
    response: getResponsePromise(stream2)
  };
}
__name(processStream, "processStream");
async function getResponsePromise(stream) {
  const allResponses = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      return addHelpers(aggregateResponses(allResponses));
    }
    allResponses.push(value);
  }
}
__name(getResponsePromise, "getResponsePromise");
function generateResponseSequence(stream) {
  return __asyncGenerator(this, arguments, /* @__PURE__ */ __name(function* generateResponseSequence_1() {
    const reader = stream.getReader();
    while (true) {
      const { value, done } = yield __await(reader.read());
      if (done) {
        break;
      }
      yield yield __await(addHelpers(value));
    }
  }, "generateResponseSequence_1"));
}
__name(generateResponseSequence, "generateResponseSequence");
function getResponseStream(inputStream) {
  const reader = inputStream.getReader();
  const stream = new ReadableStream({
    start(controller) {
      let currentText = "";
      return pump();
      function pump() {
        return reader.read().then(({ value, done }) => {
          if (done) {
            if (currentText.trim()) {
              controller.error(new GoogleGenerativeAIError("Failed to parse stream"));
              return;
            }
            controller.close();
            return;
          }
          currentText += value;
          let match = currentText.match(responseLineRE);
          let parsedResponse;
          while (match) {
            try {
              parsedResponse = JSON.parse(match[1]);
            } catch (e) {
              controller.error(new GoogleGenerativeAIError(`Error parsing JSON response: "${match[1]}"`));
              return;
            }
            controller.enqueue(parsedResponse);
            currentText = currentText.substring(match[0].length);
            match = currentText.match(responseLineRE);
          }
          return pump();
        }).catch((e) => {
          let err = e;
          err.stack = e.stack;
          if (err.name === "AbortError") {
            err = new GoogleGenerativeAIAbortError("Request aborted when reading from the stream");
          } else {
            err = new GoogleGenerativeAIError("Error reading from the stream");
          }
          throw err;
        });
      }
      __name(pump, "pump");
    }
  });
  return stream;
}
__name(getResponseStream, "getResponseStream");
function aggregateResponses(responses) {
  const lastResponse = responses[responses.length - 1];
  const aggregatedResponse = {
    promptFeedback: lastResponse === null || lastResponse === void 0 ? void 0 : lastResponse.promptFeedback
  };
  for (const response of responses) {
    if (response.candidates) {
      let candidateIndex = 0;
      for (const candidate of response.candidates) {
        if (!aggregatedResponse.candidates) {
          aggregatedResponse.candidates = [];
        }
        if (!aggregatedResponse.candidates[candidateIndex]) {
          aggregatedResponse.candidates[candidateIndex] = {
            index: candidateIndex
          };
        }
        aggregatedResponse.candidates[candidateIndex].citationMetadata = candidate.citationMetadata;
        aggregatedResponse.candidates[candidateIndex].groundingMetadata = candidate.groundingMetadata;
        aggregatedResponse.candidates[candidateIndex].finishReason = candidate.finishReason;
        aggregatedResponse.candidates[candidateIndex].finishMessage = candidate.finishMessage;
        aggregatedResponse.candidates[candidateIndex].safetyRatings = candidate.safetyRatings;
        if (candidate.content && candidate.content.parts) {
          if (!aggregatedResponse.candidates[candidateIndex].content) {
            aggregatedResponse.candidates[candidateIndex].content = {
              role: candidate.content.role || "user",
              parts: []
            };
          }
          const newPart = {};
          for (const part of candidate.content.parts) {
            if (part.text) {
              newPart.text = part.text;
            }
            if (part.functionCall) {
              newPart.functionCall = part.functionCall;
            }
            if (part.executableCode) {
              newPart.executableCode = part.executableCode;
            }
            if (part.codeExecutionResult) {
              newPart.codeExecutionResult = part.codeExecutionResult;
            }
            if (Object.keys(newPart).length === 0) {
              newPart.text = "";
            }
            aggregatedResponse.candidates[candidateIndex].content.parts.push(newPart);
          }
        }
      }
      candidateIndex++;
    }
    if (response.usageMetadata) {
      aggregatedResponse.usageMetadata = response.usageMetadata;
    }
  }
  return aggregatedResponse;
}
__name(aggregateResponses, "aggregateResponses");
async function generateContentStream(apiKey, model, params, requestOptions) {
  const response = await makeModelRequest(
    model,
    Task.STREAM_GENERATE_CONTENT,
    apiKey,
    /* stream */
    true,
    JSON.stringify(params),
    requestOptions
  );
  return processStream(response);
}
__name(generateContentStream, "generateContentStream");
async function generateContent(apiKey, model, params, requestOptions) {
  const response = await makeModelRequest(
    model,
    Task.GENERATE_CONTENT,
    apiKey,
    /* stream */
    false,
    JSON.stringify(params),
    requestOptions
  );
  const responseJson = await response.json();
  const enhancedResponse = addHelpers(responseJson);
  return {
    response: enhancedResponse
  };
}
__name(generateContent, "generateContent");
function formatSystemInstruction(input) {
  if (input == null) {
    return void 0;
  } else if (typeof input === "string") {
    return { role: "system", parts: [{ text: input }] };
  } else if (input.text) {
    return { role: "system", parts: [input] };
  } else if (input.parts) {
    if (!input.role) {
      return { role: "system", parts: input.parts };
    } else {
      return input;
    }
  }
}
__name(formatSystemInstruction, "formatSystemInstruction");
function formatNewContent(request) {
  let newParts = [];
  if (typeof request === "string") {
    newParts = [{ text: request }];
  } else {
    for (const partOrString of request) {
      if (typeof partOrString === "string") {
        newParts.push({ text: partOrString });
      } else {
        newParts.push(partOrString);
      }
    }
  }
  return assignRoleToPartsAndValidateSendMessageRequest(newParts);
}
__name(formatNewContent, "formatNewContent");
function assignRoleToPartsAndValidateSendMessageRequest(parts) {
  const userContent = { role: "user", parts: [] };
  const functionContent = { role: "function", parts: [] };
  let hasUserContent = false;
  let hasFunctionContent = false;
  for (const part of parts) {
    if ("functionResponse" in part) {
      functionContent.parts.push(part);
      hasFunctionContent = true;
    } else {
      userContent.parts.push(part);
      hasUserContent = true;
    }
  }
  if (hasUserContent && hasFunctionContent) {
    throw new GoogleGenerativeAIError("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");
  }
  if (!hasUserContent && !hasFunctionContent) {
    throw new GoogleGenerativeAIError("No content is provided for sending chat message.");
  }
  if (hasUserContent) {
    return userContent;
  }
  return functionContent;
}
__name(assignRoleToPartsAndValidateSendMessageRequest, "assignRoleToPartsAndValidateSendMessageRequest");
function formatCountTokensInput(params, modelParams) {
  var _a;
  let formattedGenerateContentRequest = {
    model: modelParams === null || modelParams === void 0 ? void 0 : modelParams.model,
    generationConfig: modelParams === null || modelParams === void 0 ? void 0 : modelParams.generationConfig,
    safetySettings: modelParams === null || modelParams === void 0 ? void 0 : modelParams.safetySettings,
    tools: modelParams === null || modelParams === void 0 ? void 0 : modelParams.tools,
    toolConfig: modelParams === null || modelParams === void 0 ? void 0 : modelParams.toolConfig,
    systemInstruction: modelParams === null || modelParams === void 0 ? void 0 : modelParams.systemInstruction,
    cachedContent: (_a = modelParams === null || modelParams === void 0 ? void 0 : modelParams.cachedContent) === null || _a === void 0 ? void 0 : _a.name,
    contents: []
  };
  const containsGenerateContentRequest = params.generateContentRequest != null;
  if (params.contents) {
    if (containsGenerateContentRequest) {
      throw new GoogleGenerativeAIRequestInputError("CountTokensRequest must have one of contents or generateContentRequest, not both.");
    }
    formattedGenerateContentRequest.contents = params.contents;
  } else if (containsGenerateContentRequest) {
    formattedGenerateContentRequest = Object.assign(Object.assign({}, formattedGenerateContentRequest), params.generateContentRequest);
  } else {
    const content = formatNewContent(params);
    formattedGenerateContentRequest.contents = [content];
  }
  return { generateContentRequest: formattedGenerateContentRequest };
}
__name(formatCountTokensInput, "formatCountTokensInput");
function formatGenerateContentInput(params) {
  let formattedRequest;
  if (params.contents) {
    formattedRequest = params;
  } else {
    const content = formatNewContent(params);
    formattedRequest = { contents: [content] };
  }
  if (params.systemInstruction) {
    formattedRequest.systemInstruction = formatSystemInstruction(params.systemInstruction);
  }
  return formattedRequest;
}
__name(formatGenerateContentInput, "formatGenerateContentInput");
function formatEmbedContentInput(params) {
  if (typeof params === "string" || Array.isArray(params)) {
    const content = formatNewContent(params);
    return { content };
  }
  return params;
}
__name(formatEmbedContentInput, "formatEmbedContentInput");
var VALID_PART_FIELDS = [
  "text",
  "inlineData",
  "functionCall",
  "functionResponse",
  "executableCode",
  "codeExecutionResult"
];
var VALID_PARTS_PER_ROLE = {
  user: ["text", "inlineData"],
  function: ["functionResponse"],
  model: ["text", "functionCall", "executableCode", "codeExecutionResult"],
  // System instructions shouldn't be in history anyway.
  system: ["text"]
};
function validateChatHistory(history) {
  let prevContent = false;
  for (const currContent of history) {
    const { role, parts } = currContent;
    if (!prevContent && role !== "user") {
      throw new GoogleGenerativeAIError(`First content should be with role 'user', got ${role}`);
    }
    if (!POSSIBLE_ROLES.includes(role)) {
      throw new GoogleGenerativeAIError(`Each item should include role field. Got ${role} but valid roles are: ${JSON.stringify(POSSIBLE_ROLES)}`);
    }
    if (!Array.isArray(parts)) {
      throw new GoogleGenerativeAIError("Content should have 'parts' property with an array of Parts");
    }
    if (parts.length === 0) {
      throw new GoogleGenerativeAIError("Each Content should have at least one part");
    }
    const countFields = {
      text: 0,
      inlineData: 0,
      functionCall: 0,
      functionResponse: 0,
      fileData: 0,
      executableCode: 0,
      codeExecutionResult: 0
    };
    for (const part of parts) {
      for (const key of VALID_PART_FIELDS) {
        if (key in part) {
          countFields[key] += 1;
        }
      }
    }
    const validParts = VALID_PARTS_PER_ROLE[role];
    for (const key of VALID_PART_FIELDS) {
      if (!validParts.includes(key) && countFields[key] > 0) {
        throw new GoogleGenerativeAIError(`Content with role '${role}' can't contain '${key}' part`);
      }
    }
    prevContent = true;
  }
}
__name(validateChatHistory, "validateChatHistory");
function isValidResponse(response) {
  var _a;
  if (response.candidates === void 0 || response.candidates.length === 0) {
    return false;
  }
  const content = (_a = response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content;
  if (content === void 0) {
    return false;
  }
  if (content.parts === void 0 || content.parts.length === 0) {
    return false;
  }
  for (const part of content.parts) {
    if (part === void 0 || Object.keys(part).length === 0) {
      return false;
    }
    if (part.text !== void 0 && part.text === "") {
      return false;
    }
  }
  return true;
}
__name(isValidResponse, "isValidResponse");
var SILENT_ERROR = "SILENT_ERROR";
var ChatSession = class {
  static {
    __name(this, "ChatSession");
  }
  constructor(apiKey, model, params, _requestOptions = {}) {
    this.model = model;
    this.params = params;
    this._requestOptions = _requestOptions;
    this._history = [];
    this._sendPromise = Promise.resolve();
    this._apiKey = apiKey;
    if (params === null || params === void 0 ? void 0 : params.history) {
      validateChatHistory(params.history);
      this._history = params.history;
    }
  }
  /**
   * Gets the chat history so far. Blocked prompts are not added to history.
   * Blocked candidates are not added to history, nor are the prompts that
   * generated them.
   */
  async getHistory() {
    await this._sendPromise;
    return this._history;
  }
  /**
   * Sends a chat message and receives a non-streaming
   * {@link GenerateContentResult}.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async sendMessage(request, requestOptions = {}) {
    var _a, _b, _c, _d, _e, _f;
    await this._sendPromise;
    const newContent = formatNewContent(request);
    const generateContentRequest = {
      safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
      generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
      tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
      toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
      systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
      cachedContent: (_f = this.params) === null || _f === void 0 ? void 0 : _f.cachedContent,
      contents: [...this._history, newContent]
    };
    const chatSessionRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    let finalResult;
    this._sendPromise = this._sendPromise.then(() => generateContent(this._apiKey, this.model, generateContentRequest, chatSessionRequestOptions)).then((result) => {
      var _a2;
      if (isValidResponse(result.response)) {
        this._history.push(newContent);
        const responseContent = Object.assign({
          parts: [],
          // Response seems to come back without a role set.
          role: "model"
        }, (_a2 = result.response.candidates) === null || _a2 === void 0 ? void 0 : _a2[0].content);
        this._history.push(responseContent);
      } else {
        const blockErrorMessage = formatBlockErrorMessage(result.response);
        if (blockErrorMessage) {
          console.warn(`sendMessage() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
        }
      }
      finalResult = result;
    }).catch((e) => {
      this._sendPromise = Promise.resolve();
      throw e;
    });
    await this._sendPromise;
    return finalResult;
  }
  /**
   * Sends a chat message and receives the response as a
   * {@link GenerateContentStreamResult} containing an iterable stream
   * and a response promise.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async sendMessageStream(request, requestOptions = {}) {
    var _a, _b, _c, _d, _e, _f;
    await this._sendPromise;
    const newContent = formatNewContent(request);
    const generateContentRequest = {
      safetySettings: (_a = this.params) === null || _a === void 0 ? void 0 : _a.safetySettings,
      generationConfig: (_b = this.params) === null || _b === void 0 ? void 0 : _b.generationConfig,
      tools: (_c = this.params) === null || _c === void 0 ? void 0 : _c.tools,
      toolConfig: (_d = this.params) === null || _d === void 0 ? void 0 : _d.toolConfig,
      systemInstruction: (_e = this.params) === null || _e === void 0 ? void 0 : _e.systemInstruction,
      cachedContent: (_f = this.params) === null || _f === void 0 ? void 0 : _f.cachedContent,
      contents: [...this._history, newContent]
    };
    const chatSessionRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    const streamPromise = generateContentStream(this._apiKey, this.model, generateContentRequest, chatSessionRequestOptions);
    this._sendPromise = this._sendPromise.then(() => streamPromise).catch((_ignored) => {
      throw new Error(SILENT_ERROR);
    }).then((streamResult) => streamResult.response).then((response) => {
      if (isValidResponse(response)) {
        this._history.push(newContent);
        const responseContent = Object.assign({}, response.candidates[0].content);
        if (!responseContent.role) {
          responseContent.role = "model";
        }
        this._history.push(responseContent);
      } else {
        const blockErrorMessage = formatBlockErrorMessage(response);
        if (blockErrorMessage) {
          console.warn(`sendMessageStream() was unsuccessful. ${blockErrorMessage}. Inspect response object for details.`);
        }
      }
    }).catch((e) => {
      if (e.message !== SILENT_ERROR) {
        console.error(e);
      }
    });
    return streamPromise;
  }
};
async function countTokens(apiKey, model, params, singleRequestOptions) {
  const response = await makeModelRequest(model, Task.COUNT_TOKENS, apiKey, false, JSON.stringify(params), singleRequestOptions);
  return response.json();
}
__name(countTokens, "countTokens");
async function embedContent(apiKey, model, params, requestOptions) {
  const response = await makeModelRequest(model, Task.EMBED_CONTENT, apiKey, false, JSON.stringify(params), requestOptions);
  return response.json();
}
__name(embedContent, "embedContent");
async function batchEmbedContents(apiKey, model, params, requestOptions) {
  const requestsWithModel = params.requests.map((request) => {
    return Object.assign(Object.assign({}, request), { model });
  });
  const response = await makeModelRequest(model, Task.BATCH_EMBED_CONTENTS, apiKey, false, JSON.stringify({ requests: requestsWithModel }), requestOptions);
  return response.json();
}
__name(batchEmbedContents, "batchEmbedContents");
var GenerativeModel = class {
  static {
    __name(this, "GenerativeModel");
  }
  constructor(apiKey, modelParams, _requestOptions = {}) {
    this.apiKey = apiKey;
    this._requestOptions = _requestOptions;
    if (modelParams.model.includes("/")) {
      this.model = modelParams.model;
    } else {
      this.model = `models/${modelParams.model}`;
    }
    this.generationConfig = modelParams.generationConfig || {};
    this.safetySettings = modelParams.safetySettings || [];
    this.tools = modelParams.tools;
    this.toolConfig = modelParams.toolConfig;
    this.systemInstruction = formatSystemInstruction(modelParams.systemInstruction);
    this.cachedContent = modelParams.cachedContent;
  }
  /**
   * Makes a single non-streaming call to the model
   * and returns an object containing a single {@link GenerateContentResponse}.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async generateContent(request, requestOptions = {}) {
    var _a;
    const formattedParams = formatGenerateContentInput(request);
    const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    return generateContent(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction, cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name }, formattedParams), generativeModelRequestOptions);
  }
  /**
   * Makes a single streaming call to the model and returns an object
   * containing an iterable stream that iterates over all chunks in the
   * streaming response as well as a promise that returns the final
   * aggregated response.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async generateContentStream(request, requestOptions = {}) {
    var _a;
    const formattedParams = formatGenerateContentInput(request);
    const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    return generateContentStream(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction, cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name }, formattedParams), generativeModelRequestOptions);
  }
  /**
   * Gets a new {@link ChatSession} instance which can be used for
   * multi-turn chats.
   */
  startChat(startChatParams) {
    var _a;
    return new ChatSession(this.apiKey, this.model, Object.assign({ generationConfig: this.generationConfig, safetySettings: this.safetySettings, tools: this.tools, toolConfig: this.toolConfig, systemInstruction: this.systemInstruction, cachedContent: (_a = this.cachedContent) === null || _a === void 0 ? void 0 : _a.name }, startChatParams), this._requestOptions);
  }
  /**
   * Counts the tokens in the provided request.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async countTokens(request, requestOptions = {}) {
    const formattedParams = formatCountTokensInput(request, {
      model: this.model,
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
      tools: this.tools,
      toolConfig: this.toolConfig,
      systemInstruction: this.systemInstruction,
      cachedContent: this.cachedContent
    });
    const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    return countTokens(this.apiKey, this.model, formattedParams, generativeModelRequestOptions);
  }
  /**
   * Embeds the provided content.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async embedContent(request, requestOptions = {}) {
    const formattedParams = formatEmbedContentInput(request);
    const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    return embedContent(this.apiKey, this.model, formattedParams, generativeModelRequestOptions);
  }
  /**
   * Embeds an array of {@link EmbedContentRequest}s.
   *
   * Fields set in the optional {@link SingleRequestOptions} parameter will
   * take precedence over the {@link RequestOptions} values provided to
   * {@link GoogleGenerativeAI.getGenerativeModel }.
   */
  async batchEmbedContents(batchEmbedContentRequest, requestOptions = {}) {
    const generativeModelRequestOptions = Object.assign(Object.assign({}, this._requestOptions), requestOptions);
    return batchEmbedContents(this.apiKey, this.model, batchEmbedContentRequest, generativeModelRequestOptions);
  }
};
var GoogleGenerativeAI = class {
  static {
    __name(this, "GoogleGenerativeAI");
  }
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  /**
   * Gets a {@link GenerativeModel} instance for the provided model name.
   */
  getGenerativeModel(modelParams, requestOptions) {
    if (!modelParams.model) {
      throw new GoogleGenerativeAIError(`Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })`);
    }
    return new GenerativeModel(this.apiKey, modelParams, requestOptions);
  }
  /**
   * Creates a {@link GenerativeModel} instance from provided content cache.
   */
  getGenerativeModelFromCachedContent(cachedContent, modelParams, requestOptions) {
    if (!cachedContent.name) {
      throw new GoogleGenerativeAIRequestInputError("Cached content must contain a `name` field.");
    }
    if (!cachedContent.model) {
      throw new GoogleGenerativeAIRequestInputError("Cached content must contain a `model` field.");
    }
    const disallowedDuplicates = ["model", "systemInstruction"];
    for (const key of disallowedDuplicates) {
      if ((modelParams === null || modelParams === void 0 ? void 0 : modelParams[key]) && cachedContent[key] && (modelParams === null || modelParams === void 0 ? void 0 : modelParams[key]) !== cachedContent[key]) {
        if (key === "model") {
          const modelParamsComp = modelParams.model.startsWith("models/") ? modelParams.model.replace("models/", "") : modelParams.model;
          const cachedContentComp = cachedContent.model.startsWith("models/") ? cachedContent.model.replace("models/", "") : cachedContent.model;
          if (modelParamsComp === cachedContentComp) {
            continue;
          }
        }
        throw new GoogleGenerativeAIRequestInputError(`Different value for "${key}" specified in modelParams (${modelParams[key]}) and cachedContent (${cachedContent[key]})`);
      }
    }
    const modelParamsFromCache = Object.assign(Object.assign({}, modelParams), { model: cachedContent.model, tools: cachedContent.tools, toolConfig: cachedContent.toolConfig, systemInstruction: cachedContent.systemInstruction, cachedContent });
    return new GenerativeModel(this.apiKey, modelParamsFromCache, requestOptions);
  }
};

// trigger/workflow-nodes.ts
var import_fluent_ffmpeg = __toESM(require_fluent_ffmpeg2());
var import_ffmpeg = __toESM(require_ffmpeg());
import fs from "fs";
import path from "path";
import os from "os";
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL: GEMINI_API_KEY is missing from environment variables!");
}
var genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");
async function resilientFetch(url) {
  try {
    let targetUrl = url;
    if (url.startsWith("/")) {
      targetUrl = `http://localhost:3001${url}`;
      console.log(`   📡 [Worker] Transforming relative path to: ${targetUrl}`);
    }
    const resp = await fetch(targetUrl);
    if (resp.ok) return resp;
    throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`);
  } catch (e) {
    if (url.includes("localhost") || url.startsWith("/")) {
      const base = url.startsWith("/") ? `http://127.0.0.1:3001${url}` : url.replace("localhost", "127.0.0.1");
      console.log(`   📡 [Worker] Initial fetch failed. Retrying with fallback: ${base}`);
      return await fetch(base);
    }
    if (url.includes("127.0.0.1")) {
      const fallbackUrl = url.replace("127.0.0.1", "localhost");
      console.log(`   📡 [Worker] 127.0.0.1 fetch failed. Retrying with localhost: ${fallbackUrl}`);
      return await fetch(fallbackUrl);
    }
    throw e;
  }
}
__name(resilientFetch, "resilientFetch");
var aiGenerator = task({
  id: "generate-text",
  run: /* @__PURE__ */ __name(async (payload) => {
    let modelName = payload.model || "gemini-2.5-flash";
    const validModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-3.1-flash-lite-preview", "gemini-3.1-pro-preview"];
    if (!validModels.includes(modelName)) {
      console.log(`⚠️ [Worker] Redirecting unknown/futuristic model '${modelName}' to stable 'gemini-2.5-flash'.`);
      modelName = "gemini-2.5-flash";
    }
    console.log(`🤖 [Worker] Starting AI Task using model: ${modelName}`);
    const apiVersion = modelName.includes("1.5") || modelName.includes("2.") || modelName.includes("3.") ? "v1beta" : "v1";
    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
    try {
      const parts = [];
      let fullText = payload.prompt;
      if (payload.systemPrompt) {
        fullText = `System Instructions: ${payload.systemPrompt}

User Request: ${payload.prompt}`;
      }
      parts.push({ text: fullText });
      if (payload.imageUrls && payload.imageUrls.length > 0) {
        for (const url of payload.imageUrls) {
          if (url.startsWith("data:")) {
            const base64Data = url.split(",")[1];
            const mimeType = url.substring(url.indexOf(":") + 1, url.indexOf(";"));
            parts.push({ inlineData: { data: base64Data, mimeType } });
          } else {
            console.log(`📡 [Worker] Fetching remote asset: ${url}`);
            const resp = await resilientFetch(url);
            if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.statusText}`);
            const buf = await resp.arrayBuffer();
            parts.push({
              inlineData: {
                data: Buffer.from(buf).toString("base64"),
                mimeType: "image/jpeg"
              }
            });
          }
        }
      }
      console.log(`🚀 [Worker] Sending request to Gemini (${parts.length} parts)...`);
      const startTime = Date.now();
      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();
      const duration = ((Date.now() - startTime) / 1e3).toFixed(1);
      console.log(`✅ [Worker] Gemini Response Received in ${duration}s`);
      return { success: true, text, duration };
    } catch (error) {
      console.error(`❌ [Worker] Gemini Execution Failed:`, error);
      let userMessage = "AI Generation failed.";
      if (error.message?.includes("fetch failed")) {
        userMessage = "Network error: Worker could not reach Google AI servers.";
      } else if (error.status === 429) {
        userMessage = "Quota Exceeded: Your Gemini API key is hitting limits.";
      } else if (error.status === 404) {
        userMessage = `Model Not Found: The model '${modelName}' is not available for your key or region.`;
      }
      return { success: false, error: userMessage, details: error.message };
    }
  }, "run")
});
import_fluent_ffmpeg.default.setFfmpegPath(import_ffmpeg.default.path);
var cropImageTask = task({
  id: "crop-image",
  run: /* @__PURE__ */ __name(async (payload) => {
    const { sourceUrl, x, y, width, height } = payload;
    console.log(`✂️ [Worker] Starting Crop Task for Node: ${payload.nodeId}`);
    const ext = sourceUrl.startsWith("data:image/png") ? "png" : "jpg";
    const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
    const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.${ext}`);
    if (sourceUrl.startsWith("data:")) {
      const base64Data = sourceUrl.split(",")[1];
      fs.writeFileSync(tempInput, base64Data, "base64");
    } else {
      console.log(`📡 [Worker] Fetching source image: ${sourceUrl}`);
      const res = await resilientFetch(sourceUrl);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(tempInput, Buffer.from(buffer));
    }
    await new Promise((resolve, reject) => {
      (0, import_fluent_ffmpeg.default)(tempInput).videoFilters(`crop=in_w*${width}/100:in_h*${height}/100:in_w*${x}/100:in_h*${y}/100`).on("end", resolve).on("error", (err) => {
        console.error("FFmpeg Error:", err);
        reject(err);
      }).save(tempOutput);
    });
    const outputBuffer = fs.readFileSync(tempOutput);
    const fileName = `cropped_${Date.now()}.${ext}`;
    let finalUrl = "";
    try {
      const { uploadToTransloadit } = await import("./transloadit-I557FRAR.mjs");
      finalUrl = await uploadToTransloadit(outputBuffer, fileName);
    } catch (err) {
      console.error("Transloadit Upload Failed, falling back to base64", err);
      finalUrl = `data:image/${ext};base64,${outputBuffer.toString("base64")}`;
    }
    fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    return { success: true, url: finalUrl };
  }, "run")
});
var extractFrameTask = task({
  id: "extract-frame",
  run: /* @__PURE__ */ __name(async (payload) => {
    const { sourceUrl, timestamp } = payload;
    console.log(`🎞️ [Worker] Starting Extract Frame Task for Node: ${payload.nodeId} at ${timestamp}`);
    const inputExt = sourceUrl.includes(".webm") ? "webm" : "mp4";
    const tempInput = path.join(os.tmpdir(), `input_vid_${Date.now()}.${inputExt}`);
    const tempOutput = path.join(os.tmpdir(), `output_frame_${Date.now()}.jpg`);
    if (sourceUrl.startsWith("data:")) {
      const base64Data = sourceUrl.split(",")[1];
      fs.writeFileSync(tempInput, base64Data, "base64");
    } else {
      console.log(`📡 [Worker] Fetching source video: ${sourceUrl}`);
      const res = await resilientFetch(sourceUrl);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(tempInput, Buffer.from(buffer));
    }
    await new Promise((resolve, reject) => {
      (0, import_fluent_ffmpeg.default)(tempInput).screenshots({
        timestamps: [timestamp],
        filename: path.basename(tempOutput),
        folder: path.dirname(tempOutput),
        size: "100%x100%"
      }).on("end", resolve).on("error", (err) => {
        console.error("FFmpeg Extract Error:", err);
        reject(err);
      });
    });
    const outputBuffer = fs.readFileSync(tempOutput);
    let finalUrl = "";
    try {
      const { uploadToTransloadit } = await import("./transloadit-I557FRAR.mjs");
      finalUrl = await uploadToTransloadit(outputBuffer, `frame_${Date.now()}.jpg`);
    } catch (err) {
      console.error("Transloadit Upload Failed, falling back to base64", err);
      finalUrl = `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;
    }
    if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    return {
      success: true,
      url: finalUrl
    };
  }, "run")
});

export {
  aiGenerator,
  cropImageTask,
  extractFrameTask
};
/*! Bundled license information:

@google/generative-ai/dist/index.mjs:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@google/generative-ai/dist/index.mjs:
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=chunk-RLC6WJLK.mjs.map
