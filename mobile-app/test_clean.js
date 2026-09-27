const { execSync } = require('child_process');
const path = require('path');

const JDK_BIN = 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot\\bin';
const BUILD_TOOLS = 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Android\\Sdk\\build-tools\\34.0.0';
const APKSIGNER = path.join(BUILD_TOOLS, 'apksigner.bat');

const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot',
  PATH: `${JDK_BIN};${BUILD_TOOLS};${process.env.PATH}`
};

try {
  console.log(execSync(`"${APKSIGNER}" verify --verbose --min-sdk-version 21 mngroups-debug.apk`, { env }).toString());
} catch(e) {
  console.log('Error:', e.stdout ? e.stdout.toString() : e.message);
}
