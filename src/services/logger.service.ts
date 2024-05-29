import { MESSAGE_TYPE } from "../contracts/types/messages.types";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export class Logger {
  private logEnabled: boolean;
  private logTimeEnabled: boolean;

  constructor(private logLevel: LogLevel = LogLevel.INFO) {
    this.logEnabled = true;
    this.logTimeEnabled = true;
  }

  log(message: MESSAGE_TYPE, level: LogLevel = LogLevel.INFO): void {
    if (!this.logEnabled || LogLevel[level] < LogLevel[this.logLevel]) {
      return;
    }

    const timestamp = this.logTimeEnabled ? this.getTimestamp() : "";
    console.log(
      `[${level}] ${timestamp} ${
        typeof message === "string" ? message : `${message}`
      }`
    );
  }

  debug(message: MESSAGE_TYPE): void {
    this.log(message, LogLevel.DEBUG);
  }

  info(message: MESSAGE_TYPE): void {
    this.log(message, LogLevel.INFO);
  }

  warn(message: MESSAGE_TYPE): void {
    this.log(message, LogLevel.WARN);
  }

  error(message: MESSAGE_TYPE): void {
    this.logError(`[ERROR] ${this.getTimestamp()} ${message}`);
  }

  fatal(message: MESSAGE_TYPE): void {
    this.logError(`[FATAL] ${this.getTimestamp()} ${message}`);
  }

  enableLogging(): void {
    this.logEnabled = true;
  }

  disableLogging(): void {
    this.logEnabled = false;
  }

  enableLogTime(): void {
    this.logTimeEnabled = true;
  }

  disableLogTime(): void {
    this.logTimeEnabled = false;
  }

  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private logError(message: MESSAGE_TYPE): void {
    if (!this.logEnabled) {
      return;
    }

    console.error(message);
  }
}

export const logger = new Logger();
