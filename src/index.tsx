import { logger, fileAsyncTransport } from 'react-native-logs';
import RNFS from 'react-native-fs';
import { zip } from 'react-native-zip-archive';
import OpenPGP from 'react-native-fast-openpgp';

export type LoggerLog = {
  debug: (message?: any) => void;
  info: (message?: any) => void;
  warn: (message?: any) => void;
  error: (message?: any) => void;
};

type Logs = {
  extend: (extension: string) => LoggerLog;
  /** Enable an extension */
  enable: (extension: string) => boolean;
  /** Disable an extension */
  disable: (extension: string) => boolean;
  /** Return all created extensions */
  getExtensions: () => string[];
  /** Set log severity API */
  setSeverity: (level: string) => string;
  /** Get current log severity API */
  getSeverity: () => string;
};

declare type LogTyped = {
  [key: string]: any;
} & Logs;

export type LoggerConfig = {
  logDirectoryPath: string;
  publicKey: string;
  encryptedFilePath: string;
  deleteLogsAfterDays: number;
};

export const createDirectory = async (path: string): Promise<void> => {
  const directoryPath = `${RNFS.DocumentDirectoryPath}/${path}`;
  const hasDirectory = await RNFS.exists(directoryPath);
  if (!hasDirectory) {
    await RNFS.mkdir(directoryPath);
  }
};

class Logger {
  public logger = {} as LogTyped;

  public documentDirectoryPath = RNFS.DocumentDirectoryPath;

  private logDirectoryPath = `${RNFS.DocumentDirectoryPath}/logs`;

  private subPath = `logs`;

  private static instance: Logger;

  private zipPath = `${RNFS.DocumentDirectoryPath}/logs.zip`;

  private encryptedFilePath = `${RNFS.DocumentDirectoryPath}/AppData`;

  private publicKey = '';

  private removeLogsDays = 30;

  private constructor(conf: LoggerConfig) {
    this.createDirectory();
    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    this.logDirectoryPath = `${RNFS.DocumentDirectoryPath}${conf.logDirectoryPath}`;
    this.subPath = conf.logDirectoryPath;
    this.publicKey = conf.publicKey;
    this.removeLogsDays = conf.deleteLogsAfterDays;
    this.encryptedFilePath = `${RNFS.DocumentDirectoryPath}${conf.encryptedFilePath}`;

    console.log('DOCUMENT_DIR', RNFS.DocumentDirectoryPath);

    const config = {
      transport: fileAsyncTransport,
      transportOptions: {
        async: true,
        FS: RNFS,
        fileName: `${this.subPath}/logs_${date}-${month}-${year}.log`,
      },
    };

    this.logger = logger.createLogger(config) as unknown as LogTyped;
    if (this.logger) {
      console.log('Logger setup successful!');
    }
    this.cleanFolder();
  }

  static getInstance = (): Logger => this.instance;

  cleanFolder = async (): Promise<void> => {
    const result = await RNFS.readDir(this.logDirectoryPath);
    const rLogsDate = new Date(new Date().getDate() - this.removeLogsDays);
    if (result) {
      result.forEach((fileData) => {
        if (
          fileData?.ctime &&
          fileData.ctime.getTime() <= rLogsDate.getTime()
        ) {
          RNFS.unlink(fileData.path);
        }
      });
    }
  };

  static setup = (config: LoggerConfig): void => {
    this.instance = new Logger(config);
  };

  private createDirectory = async (): Promise<void> => {
    const hasDirectory = await RNFS.exists(this.logDirectoryPath);
    if (!hasDirectory) {
      await RNFS.mkdir(this.logDirectoryPath);
    }
  };

  public copyFileToLogPath = async (filePath: string): Promise<void> => {
    const hasDirectory = await RNFS.exists(this.logDirectoryPath);
    if (!hasDirectory) {
      await RNFS.mkdir(this.logDirectoryPath);
    }
    await RNFS.copyFile(filePath, this.logDirectoryPath);
  };

  public clean = async (): Promise<void> => {
    await RNFS.unlink(this.encryptedFilePath);
    await RNFS.unlink(this.zipPath);
  };

  public makeZipAndEncrypt = async (): Promise<string> => {
    await zip(this.logDirectoryPath, this.zipPath);
    return OpenPGP.encryptFile(
      this.zipPath,
      this.encryptedFilePath,
      this.publicKey
    );
  };
}

export { Logger };
