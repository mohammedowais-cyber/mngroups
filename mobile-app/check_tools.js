const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const JDK_BIN = 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot\\bin';
const SDK_DIR = 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Android\\Sdk';
const BUILD_TOOLS = path.join(SDK_DIR, 'build-tools', '34.0.0');
const PLATFORM = path.join(SDK_DIR, 'platforms', 'android-34');

const JAVAC = path.join(JDK_BIN, 'javac.exe');
const JAR = path.join(JDK_BIN, 'jar.exe');
const KEYTOOL = path.join(JDK_BIN, 'keytool.exe');
const AAPT2 = path.join(BUILD_TOOLS, 'aapt2.exe');
const D8 = path.join(BUILD_TOOLS, 'd8.bat');
const ZIPALIGN = path.join(BUILD_TOOLS, 'zipalign.exe');
const APKSIGNER = path.join(BUILD_TOOLS, 'apksigner.bat');
const ANDROID_JAR = path.join(PLATFORM, 'android.jar');

console.log('Checking tools...');
console.log('javac:', fs.existsSync(JAVAC));
console.log('jar:', fs.existsSync(JAR));
console.log('keytool:', fs.existsSync(KEYTOOL));
console.log('aapt2:', fs.existsSync(AAPT2));
console.log('d8:', fs.existsSync(D8));
console.log('zipalign:', fs.existsSync(ZIPALIGN));
console.log('apksigner:', fs.existsSync(APKSIGNER));
console.log('android.jar:', fs.existsSync(ANDROID_JAR));

const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot',
  PATH: `${JDK_BIN};${BUILD_TOOLS};${process.env.PATH}`
};

try {
  console.log('javac version:', execSync(`"${JAVAC}" -version`, { env }).toString().trim());
  console.log('aapt2 version:', execSync(`"${AAPT2}" version`, { env }).toString().trim());
  console.log('d8 version:', execSync(`"${D8}" --version`, { env }).toString().trim());
  console.log('apksigner version:', execSync(`"${APKSIGNER}" --version`, { env }).toString().trim());
} catch (e) {
  console.error('Error running test tool:', e.message);
}
