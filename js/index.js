"use strict";
const Winston = require("winston");
const FS = require("fs");
const Stream = require("stream");
const lagash_config_1 = require("lagash-config");
let logsDir = lagash_config_1.default.get("logsDir") || "/logs";
class LoggerStream extends Stream.Writable {
    constructor(logger, level) {
        super();
        this.buffer = "";
        this.logger = logger;
        this.level = level;
    }
    _write(chunk, encoding, callback) {
        this.buffer += chunk.toString();
        let idx;
        while ((idx = this.buffer.indexOf("\n")) >= 0) {
            this.logger[this.level](this.buffer.slice(0, idx));
            this.buffer = this.buffer.slice(idx + 1);
        }
        callback();
    }
}
exports.LoggerStream = LoggerStream;
class Logger {
    constructor(domain) {
        if (Logger.useLogsDirectory()) {
            this.logger = Winston.loggers.add(domain, {
                console: {
                    colorize: true,
                    label: domain,
                    level: "debug"
                },
                file: {
                    filename: `${logsDir}/${domain}.logs`,
                    maxFiles: 50,
                    tailable: true,
                    level: "info"
                }
            });
        }
        else {
            this.logger = Winston.loggers.add(domain, {
                console: {
                    colorize: true,
                    label: domain,
                    level: "debug"
                }
            });
        }
    }
    static useLogsDirectory() {
        if (Logger.logsDirExists == undefined) {
            try {
                FS.accessSync(logsDir);
                Logger.logsDirExists = true;
            }
            catch (err) {
                Logger.logsDirExists = false;
            }
        }
        return Logger.logsDirExists;
    }
    static parseError(err) {
        if (err instanceof Error) {
            return `Name: ${err.name}, Message: ${err.message}, Stack: ${err.stack}`;
        }
        else if (err instanceof Object) {
            return JSON.stringify(err);
        }
        return err.toString();
    }
    getWritableStream(level) {
        return new LoggerStream(this, level);
    }
    debug(msg) {
        this.logger.debug(Logger.parseError(msg));
    }
    info(msg) {
        this.logger.info(Logger.parseError(msg));
    }
    warn(msg) {
        this.logger.warn(Logger.parseError(msg));
    }
    error(msg) {
        this.logger.error(Logger.parseError(msg));
    }
}
Logger.logsDirExists = undefined;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Logger;
//# sourceMappingURL=index.js.map