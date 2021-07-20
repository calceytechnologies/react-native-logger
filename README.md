# react-native-logger

A logger for Calcey react-native projects

## Installation

```sh
yan add https://github.com/calceytechnologies/react-native-logger
```

## Usage

- One log will be created per day

```js
import { Logger } from 'react-native-logger';

// Setting up

const defaultConfig = {
  logDirectoryPath: '/logs', //Path for logs to save
  encryptedFilePath: '/AppData', // Path to save the encrypted file
  publicKey: 'publicKey', // This should be a PGP public key
  deleteLogsAfterDays: 30, // Delete logs if they are created more than 30 days ago
};

try {
  Logger.setup(defaultConfig);
  const log = Logger.getInstance().logger;

  // Can configure multiple log types
  const generalLog = log.extend('general');
  log.enable('general');
  generalLog.error('TEST ERROR');
} catch (e) {
  //
}

// Make a zip, encrypt and get the file url

const filePath = await Logger.getInstance().makeZipAndEncrypt();

// You can email/ share this file. Afterwards, you will need at tool to decrypt the file such as https://pgptool.github.io/ (For testing purposes, use they key given)
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
