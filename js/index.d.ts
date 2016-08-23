/// <reference types="node" />
import * as Stream from "stream";
export declare class LoggerStream extends Stream.Writable {
    private logger;
    private level;
    private buffer;
    constructor(logger: Logger, level: "error" | "warn" | "info" | "debug");
    _write(chunk: any, encoding: any, callback: Function): any;
}
export default class Logger {
    private logger;
    private static logsDirExists;
    private static useLogsDirectory();
    constructor(domain: string);
    private static parseError(err);
    getWritableStream(level: "error" | "warn" | "info" | "debug"): LoggerStream;
    debug(msg: any): void;
    info(msg: any): void;
    warn(msg: any): void;
    error(msg: any): void;
}
