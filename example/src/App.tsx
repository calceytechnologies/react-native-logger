import * as React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Logger, LoggerConfig } from 'react-native-logger';
import RNFS from 'react-native-fs';

export default function App() {
  const [content, setFolderContent] = React.useState([{ name: 'no content' }]);
  const [textContent, setTextContent] = React.useState('');

  const defaultConfig: LoggerConfig = {
    logDirectoryPath: '/logs',
    encryptedFilePath: '/AppData',
    publicKey: 'LOG_PUBLIC_KEY',
    deleteLogsAfterDays: 30,
  };

  const getContent = async () => {
    try {
      Logger.setup(defaultConfig);
      const log = Logger.getInstance().logger;
      const generalLog = log.extend('general');
      log.enable('general');
      generalLog.error('test text');
      const dirs = await RNFS.readDir(
        `${Logger.getInstance().documentDirectoryPath}/logs`
      );
      setFolderContent(dirs);
    } catch (e) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    // Logger.setup(defaultConfig);
    // const log = Logger.getInstance().logger;
    // const generalLog = log.extend('general');
    // log.enable('general');
    // generalLog.error('error');
    getContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileNamePressed = async (file: any) => {
    try {
      const documentPath = Logger.getInstance().documentDirectoryPath;
      const text = await RNFS.readFile(`${documentPath}/logs/${file.name}`);
      setTextContent(text);

      const filePath = Logger.getInstance().makeZipAndEncrypt();
      console.log(filePath);
    } catch (e) {
      Alert.alert(e);
    }
  };

  return (
    <>
      {content.map((file) => {
        return (
          <TouchableOpacity
            onPress={async () => {
              onFileNamePressed(file);
            }}
            style={styles.container}
          >
            <Text>{file.name}</Text>
          </TouchableOpacity>
        );
      })}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text>{textContent}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
