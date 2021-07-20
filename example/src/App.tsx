import * as React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  View,
} from 'react-native';
import { Logger, LoggerConfig } from 'react-native-logger';
import RNFS from 'react-native-fs';

const publicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: Keybase OpenPGP v1.0.0
Comment: https://keybase.io/crypto

xo0EYPZK+gEEAMd46YIgjQEY/jbh3f8NebaxY101pNnZS7FIvuV/uj1WfWR241Ks
S+A0HgIy+XPb55ClOCaQtp9Md0iNgrbJ5yJ8mfh/G0mBeYIGVHhSkh+GK5COXfQd
HAYfu7I+qS0NUjqdQAHAGT7ZjUAoqeNI5uM6qMCU11yfIeC1+KGcmDt5ABEBAAHN
GnJpc2luYSA8cmlzaW5hQGNhbGNleS5jb20+wq0EEwEKABcFAmD2SvoCGy8DCwkH
AxUKCAIeAQIXgAAKCRBySuALw3nslm12A/4u/HZuTBh1zCr7DsAEWkoMxSajQDZl
TlfWZmPSH4vnOl93ekTH6Ctv5uMLxjKodjcYgY76U+iMjqwvM7uhmF5WMA3Rn531
Q5z5RnQgMmzca/UZ/I7DyYbMKW1+OoXFrTy3K3qyXaMZXBd8sP0Rn5j/v+pE+iGy
9nEoyaXF0Bh1O86NBGD2SvoBBADOn3AU2q9iqggDUWR5MEvEupQBRhW+uNT4JqGo
kgX1UMeCZ3TgLBEQCd7dC11+AaQNw876EBD+PiAyZ4kAiGn103ttFSboPzEzM2wZ
GnfFm2GlqpFEjOr5kE13ZRZjBTSEckdKbTgsSYDQJfpbBjY2itO/R9R1ZB/93tgp
UYbdewARAQABwsCDBBgBCgAPBQJg9kr6BQkPCZwAAhsuAKgJEHJK4AvDeeyWnSAE
GQEKAAYFAmD2SvoACgkQwdlSufq8/Y5q2gQAkTzHzaM2R3qHgW7ufstXPkAGt3Iq
OkVlnhZfoYi+Fnzre2UuFTfQ9k1+cv4oq/ZcDjd8Bq3mMCAI+m/zqe0Tqeasag3s
6bu2De04aU3MCQUgQIU700qMFEqFebqs6soJBTBI/BM8L7ABwZ8e7Ft5450Ty8+1
c/E7FmZNIgEAEPQO9wQAhiB4SAr07HWtIE/ANk7RWzjVkvTx+z82pCxcNk7+Ux1W
qJFFpVdNEAB7YnKO38re/TVjS/Zp61z7XlRrxzPbCCYTPoaaksALDGjN0H8bUR6P
R8fDoYTR9J443qRDBYkJdhpNHiFhUFY6ftr7UwtU9pApXzxheuzHEbsIDc2JNkrO
jQRg9kr6AQQAxDFKnm3ll0SvhLwd203673+KqlJpPSNcOM+0HWP/Jt08HyBW04uI
md3FVedjSRqAPC+AOFn0khTqfGo/6Mhh9RB0gTIIgiu1UzjEFw7pPUm/JNsI7VYN
it7xA0Rt4T7hwd5/ZqhyZoDpLJUTjvBAY7eJCBzr1FwVfijhyV0zk30AEQEAAcLA
gwQYAQoADwUCYPZK+gUJDwmcAAIbLgCoCRBySuALw3nslp0gBBkBCgAGBQJg9kr6
AAoJECC5hxl00+7C4MAEAIGAnHt2f9a7tPa78ORU8C+24ss26RF03WO6mrLAgE3J
KtYQ/v5zjqkzclNfYW7I3j3qSRrkasrrcl1ewdwbfRg+8ymcsBwdzgp/6Enajpgo
IAElcYJdtX4KWUfjrgkWoMwVeDe+YxNjIM7zIsP7jQzHrmV3jjm348v8oQzWEDGX
rQUEAMZp40sLiWil20A+Oxn5SfwEuRR9Gb2gDZaW+l2v4L5uAT0merfIXQxTotnq
tIqUima0qq8UIp2hKcQ8ZtjQHECIfGeZSNU1rrSryiMbJPucBVXf40qjWCesDkUj
teQpeUwNL4Zc2C8Lx5L+5vWpM9gJucw2eYVQbw4sKFklWBnz
=dofz
-----END PGP PUBLIC KEY BLOCK-----
`;

export default function App() {
  const [content, setFolderContent] = React.useState([{ name: 'no content' }]);
  const [textContent, setTextContent] = React.useState('');

  const defaultConfig: LoggerConfig = {
    logDirectoryPath: '/logs',
    encryptedFilePath: '/AppData',
    publicKey: publicKey,
    deleteLogsAfterDays: 30,
  };

  const getContent = async () => {
    try {
      Logger.setup(defaultConfig);
      const log = Logger.getInstance().logger;
      const generalLog = log.extend('general');
      log.enable('general');
      generalLog.error('TEST ERROR');
      const dirs = await RNFS.readDir(
        `${Logger.getInstance().documentDirectoryPath}/logs`
      );
      setFolderContent(dirs);
    } catch (e) {
      console.log(e);
    }
  };

  React.useEffect(() => {
    getContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileNamePressed = async (file: any) => {
    try {
      const documentPath = Logger.getInstance().documentDirectoryPath;
      const text = await RNFS.readFile(`${documentPath}/logs/${file.name}`);
      setTextContent(text);
      const filePath = await Logger.getInstance().makeZipAndEncrypt();
      Alert.alert(filePath);
    } catch (e) {
      Alert.alert(JSON.stringify(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text>
        Files in logs directory. Tap to view content and get encrypted file
        path.
      </Text>
      {content.map((file) => {
        return (
          <TouchableOpacity
            onPress={() => {
              onFileNamePressed(file);
            }}
            style={styles.button}
          >
            <Text>{file.name}</Text>
          </TouchableOpacity>
        );
      })}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text>{textContent}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 20,
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
