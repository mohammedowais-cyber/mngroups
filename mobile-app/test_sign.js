const { execSync } = require('child_process');
const path = require('path');

const JDK_BIN = 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot\\bin';
const BUILD_TOOLS = 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Android\\Sdk\\build-tools\\34.0.0';
const APKSIGNER = path.join(BUILD_TOOLS, 'apksigner.bat');
const ZIPALIGN = path.join(BUILD_TOOLS, 'zipalign.exe');

const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot',
  PATH: `${JDK_BIN};${BUILD_TOOLS};${process.env.PATH}`
};

const unaligned = 'mobile-app/build/apk_staging/unaligned.apk';
const cleanAligned = 'mobile-app/build/apk_staging/clean_aligned.apk';
const finalSigned = 'mobile-app/build/clean_signed.apk';
const keystore = 'mobile-app/build/apk_staging/debug.keystore';

// Align first (from unaligned unsigned)
execSync(`"${ZIPALIGN}" -p -f 4 "${unaligned}" "${cleanAligned}"`, { env, stdio: 'inherit' });

// Sign with apksigner specifying min-sdk-version 21 and v1, v2, v3
execSync(`"${APKSIGNER}" sign --ks "${keystore}" --ks-pass pass:android --key-pass pass:android --min-sdk-version 21 --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${finalSigned}" "${cleanAligned}"`, { env, stdio: 'inherit' });

console.log(execSync(`"${APKSIGNER}" verify --verbose "${finalSigned}"`, { env }).toString());
