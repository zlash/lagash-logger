import * as Winston from "winston";
import * as FS from "fs";
import * as Stream from "stream";
import Config from "lagash-config";


let logsDir = Config.get("logsDir") || "/logs";

export class LoggerStream extends Stream.Writable {
    private logger: Logger;
    private level: string;
    private buffer: string = "";

    constructor(logger: Logger, level: "error" | "warn" | "info" | "debug") {
        super();
        this.logger = logger;
        this.level = level;
    }

    _write(chunk: any, encoding: any, callback: Function): any {
        this.buffer += chunk.toString();
        let idx: number;
        while ((idx = this.buffer.indexOf("\n")) >= 0) {
            this.logger[this.level](this.buffer.slice(0, idx));
            this.buffer = this.buffer.slice(idx + 1);
        }

        callback();
    }
}

export default class Logger {

    private logger: Winston.LoggerInstance;
    private static logsDirExists: boolean = undefined;

    private static useLogsDirectory(): boolean {
        if (Logger.logsDirExists == undefined) {
            try {
                FS.accessSync(logsDir);
                Logger.logsDirExists = true;
            } catch (err) {
                Logger.logsDirExists = false;
            }
        }
        return Logger.logsDirExists;
    }

    constructor(domain: string) {

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
        } else {
            this.logger = Winston.loggers.add(domain, {
                console: {
                    colorize: true,
                    label: domain,
                    level: "debug"
                }
            });
        }
    }

    private static parseError(err: any): string {
        if (err instanceof Error) {
            return `Name: ${err.name}, Message: ${err.message}, Stack: ${err.stack}`;
        } else if (err instanceof Object) {
            return JSON.stringify(err);
        }
        return err.toString();
    }

    getWritableStream(level: "error" | "warn" | "info" | "debug"): LoggerStream {
        return new LoggerStream(this, level);
    }

    debug(msg: any): void {
        this.logger.debug(Logger.parseError(msg));
    }


    info(msg: any): void {
        this.logger.info(Logger.parseError(msg));
    }

    warn(msg: any): void {
        this.logger.warn(Logger.parseError(msg));
    }

    error(msg: any): void {
        this.logger.error(Logger.parseError(msg));
    }

}
