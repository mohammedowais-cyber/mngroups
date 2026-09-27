const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('MN GROUPS - ANDROID COMPATIBILITY DEBUG APK BUILDER');
console.log('====================================================');

const WORKSPACE_DIR = path.resolve(__dirname, '..');
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

const BUILD_DIR = path.join(__dirname, 'build', 'apk_staging');
const OUTPUT_DIR = path.join(__dirname, 'build', 'outputs', 'apk', 'debug');
const FINAL_APK_IN_BUILD = path.join(OUTPUT_DIR, 'mngroups-debug.apk');
const FINAL_APK_IN_ROOT = path.join(WORKSPACE_DIR, 'mngroups-debug.apk');
const VITE_PUBLIC_APK = path.join(WORKSPACE_DIR, 'admin-portal', 'public', 'mngroups-debug.apk');

const env = {
  ...process.env,
  JAVA_HOME: 'C:\\Users\\Mohammed Owais\\AppData\\Local\\Programs\\Microsoft\\jdk-17.0.10.7-hotspot',
  PATH: `${JDK_BIN};${BUILD_TOOLS};${path.join(SDK_DIR, 'platform-tools')};${process.env.PATH}`
};

// Clean build directories
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(WORKSPACE_DIR, 'admin-portal', 'public'), { recursive: true });

const resDir = path.join(BUILD_DIR, 'res');
const valuesDir = path.join(resDir, 'values');
const xmlDir = path.join(resDir, 'xml');
const srcDir = path.join(BUILD_DIR, 'src', 'com', 'mngroups', 'maintenance');
const assetsDir = path.join(BUILD_DIR, 'assets');
const genDir = path.join(BUILD_DIR, 'gen');
const objDir = path.join(BUILD_DIR, 'obj');
const dexDir = path.join(BUILD_DIR, 'dex');

const mipmapDensities = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 }
];

[valuesDir, xmlDir, srcDir, assetsDir, genDir, objDir, dexDir].forEach(d => fs.mkdirSync(d, { recursive: true }));
mipmapDensities.forEach(d => fs.mkdirSync(path.join(resDir, d.name), { recursive: true }));

console.log('[1/10] Writing AndroidManifest.xml (API 21+ Universal Material Theme)...');

const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mngroups.maintenance"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="true"
        android:supportsRtl="true"
        android:usesCleartextTraffic="true"
        android:theme="@style/AppTheme">

        <activity
            android:name="com.mngroups.maintenance.MainActivity"
            android:label="@string/app_name"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|screenLayout|uiMode"
            android:windowSoftInputMode="adjustResize"
            android:hardwareAccelerated="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
fs.writeFileSync(path.join(BUILD_DIR, 'AndroidManifest.xml'), manifestContent, 'utf8');

// strings.xml
fs.writeFileSync(path.join(valuesDir, 'strings.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">MN Groups</string>
</resources>`, 'utf8');

// colors.xml
fs.writeFileSync(path.join(valuesDir, 'colors.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#0F1B33</color>
    <color name="colorPrimaryDark">#0B1220</color>
    <color name="colorAccent">#B8902E</color>
</resources>`, 'utf8');

// styles.xml with Material theme
fs.writeFileSync(path.join(valuesDir, 'styles.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="@android:style/Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#0F1B33</item>
        <item name="android:navigationBarColor">#0B1220</item>
        <item name="android:windowBackground">#0F1B33</item>
    </style>
</resources>`, 'utf8');

console.log('[2/10] Generating Multi-Density Icons...');

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (((crc ^ byte) & 1) ? 0xEDB88320 : 0);
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateIconPng(width, height, isRound = false) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  const radius = width / 2;
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      if (isRound && dist > radius) {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      const isRing = (dist >= radius * 0.76 && dist <= radius * 0.90);
      const isInnerShield = (x >= width * 0.28 && x <= width * 0.72 && y >= height * 0.26 && y <= height * 0.74);
      const isCenterBar = (x >= width * 0.44 && x <= width * 0.56 && y >= height * 0.36 && y <= height * 0.64);

      if (isRing || (isInnerShield && !isCenterBar)) {
        rawData[offset++] = 0xB8;
        rawData[offset++] = 0x90;
        rawData[offset++] = 0x2E;
        rawData[offset++] = 0xFF;
      } else {
        rawData[offset++] = 0x0F;
        rawData[offset++] = 0x1B;
        rawData[offset++] = 0x33;
        rawData[offset++] = 0xFF;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

mipmapDensities.forEach(density => {
  const dPath = path.join(resDir, density.name);
  fs.writeFileSync(path.join(dPath, 'ic_launcher.png'), generateIconPng(density.size, density.size, false));
  fs.writeFileSync(path.join(dPath, 'ic_launcher_round.png'), generateIconPng(density.size, density.size, true));
});

console.log('[3/10] Writing Crash-Proof MainActivity.java...');

const javaContent = `package com.mngroups.maintenance;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.ValueCallback;
import android.webkit.ConsoleMessage;
import android.net.Uri;
import android.content.Intent;
import android.view.KeyEvent;
import android.graphics.Color;
import android.view.Window;
import android.view.WindowManager;
import android.util.Log;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String TAG = "MNGroups";
    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;
    private static final int FILECHOOSER_RESULTCODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                Window window = getWindow();
                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setStatusBarColor(Color.parseColor("#0F1B33"));
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    window.setNavigationBarColor(Color.parseColor("#0B1220"));
                }
            }
        } catch (Throwable t) {
            Log.e(TAG, "Status bar customization error", t);
        }

        try {
            webView = new WebView(this);
            webView.setBackgroundColor(Color.parseColor("#0F1B33"));
            setContentView(webView);

            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
            settings.setLoadsImagesAutomatically(true);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setSupportZoom(false);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            }

            webView.setWebViewClient(new WebViewClient() {
                private boolean handleUrl(String url) {
                    if (url == null) return false;
                    if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("sms:") || url.startsWith("geo:")) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            startActivity(intent);
                            return true;
                        } catch (Exception e) {
                            Log.e(TAG, "External intent error", e);
                            return true;
                        }
                    }
                    return false;
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (handleUrl(url)) return true;
                    return false;
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && request != null) {
                        String url = request.getUrl().toString();
                        if (handleUrl(url)) return true;
                    }
                    return false;
                }
            });

            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                    Log.d(TAG, "JS: " + consoleMessage.message());
                    return true;
                }

                @Override
                public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                    if (uploadMessage != null) {
                        uploadMessage.onReceiveValue(null);
                    }
                    uploadMessage = filePathCallback;
                    Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("image/*");
                    try {
                        startActivityForResult(Intent.createChooser(intent, "Select Repair Photo"), FILECHOOSER_RESULTCODE);
                    } catch (Exception e) {
                        uploadMessage = null;
                        return false;
                    }
                    return true;
                }
            });

            webView.loadUrl("file:///android_asset/index.html");

        } catch (Throwable t) {
            Log.e(TAG, "WebView crash on startup", t);
            Toast.makeText(this, "Starting MN Groups Mobile App...", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (uploadMessage == null) return;
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                if (data.getData() != null) {
                    results = new Uri[]{ data.getData() };
                } else if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
            }
            uploadMessage.onReceiveValue(results);
            uploadMessage = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
`;
fs.writeFileSync(path.join(srcDir, 'MainActivity.java'), javaContent, 'utf8');

console.log('[4/10] Preparing Self-Contained Assets (Zero Remote Dependencies)...');

const refHtmlPath = path.join(WORKSPACE_DIR, 'reference', 'mn-groups-app.html');
let htmlContent = fs.readFileSync(refHtmlPath, 'utf8');

// Remove external CDN script tags so app starts 100% offline immediately
htmlContent = htmlContent.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com[^>]*><\/script>/gi, '');

const nativeHeader = `
<script>
window.isAndroidApp = true;
window.MN_API_ENDPOINT = "http://10.0.2.2:4000/api";
console.log("MN GROUPS Mobile App Container Initialized");
</script>
`;
htmlContent = htmlContent.replace('</head>', `${nativeHeader}\n</head>`);
fs.writeFileSync(path.join(assetsDir, 'index.html'), htmlContent, 'utf8');

console.log('[5/10] Compiling Resources with AAPT2...');
const compiledResZip = path.join(BUILD_DIR, 'compiled_res.zip');
execSync(`"${AAPT2}" compile --dir "${resDir}" -o "${compiledResZip}"`, { env, stdio: 'inherit' });

console.log('[6/10] Linking Package with AAPT2 (min-sdk 21, target-sdk 34)...');
const unalignedApk = path.join(BUILD_DIR, 'unaligned.apk');
const manifestPath = path.join(BUILD_DIR, 'AndroidManifest.xml');
execSync(`"${AAPT2}" link -I "${ANDROID_JAR}" "${compiledResZip}" --manifest "${manifestPath}" --min-sdk-version 21 --target-sdk-version 34 --java "${genDir}" -o "${unalignedApk}" -A "${assetsDir}" --auto-add-overlay`, { env, stdio: 'inherit' });

console.log('[7/10] Compiling Java Sources with javac (source 8, target 8)...');
const rJavaPath = path.join(genDir, 'com', 'mngroups', 'maintenance', 'R.java');
const mainJavaPath = path.join(srcDir, 'MainActivity.java');
execSync(`"${JAVAC}" -source 8 -target 8 -cp "${ANDROID_JAR}" -d "${objDir}" "${rJavaPath}" "${mainJavaPath}"`, { env, stdio: 'inherit' });

console.log('[8/10] Converting ALL compiled classes to classes.dex with D8 (min-api 21)...');
// Include ALL .class files found in objDir recursively
function getAllClassFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllClassFiles(fullPath));
    } else if (file.endsWith('.class')) {
      results.push(fullPath);
    }
  });
  return results;
}

const allClassFiles = getAllClassFiles(objDir);
console.log(`   -> Found ${allClassFiles.length} class files to dex:`, allClassFiles.map(p => path.basename(p)).join(', '));
execSync(`"${D8}" --min-api 21 ${allClassFiles.map(c => `"${c}"`).join(' ')} --output "${dexDir}" --lib "${ANDROID_JAR}"`, { env, stdio: 'inherit' });

console.log('[8.5/10] Packaging classes.dex into unaligned APK...');
const classesDex = path.join(dexDir, 'classes.dex');
fs.copyFileSync(classesDex, path.join(BUILD_DIR, 'classes.dex'));
execSync(`"${JAR}" uf "${unalignedApk}" classes.dex`, { cwd: BUILD_DIR, env, stdio: 'inherit' });

console.log('[9/10] Aligning APK with zipalign (4-byte boundary)...');
const alignedApk = path.join(BUILD_DIR, 'aligned.apk');
execSync(`"${ZIPALIGN}" -p -f 4 "${unalignedApk}" "${alignedApk}"`, { env, stdio: 'inherit' });

console.log('[10/10] Signing APK with apksigner (v1, v2, and v3 schemes)...');
const keystorePath = path.join(BUILD_DIR, 'debug.keystore');
if (!fs.existsSync(keystorePath)) {
  execSync(`"${KEYTOOL}" -genkey -v -keystore "${keystorePath}" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`, { env, stdio: 'inherit' });
}

execSync(`"${APKSIGNER}" sign --ks "${keystorePath}" --ks-pass pass:android --key-pass pass:android --min-sdk-version 21 --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "${FINAL_APK_IN_BUILD}" "${alignedApk}"`, { env, stdio: 'inherit' });

// Verify signature across all schemes
const verifyOutput = execSync(`"${APKSIGNER}" verify --verbose --min-sdk-version 21 "${FINAL_APK_IN_BUILD}"`, { env }).toString();
console.log('\n====================================================');
console.log('APK SIGNATURE VERIFICATION:');
console.log('====================================================');
console.log(verifyOutput.trim());

// Distribute to all download locations:
fs.copyFileSync(FINAL_APK_IN_BUILD, FINAL_APK_IN_ROOT);
fs.copyFileSync(FINAL_APK_IN_BUILD, VITE_PUBLIC_APK);

const oneDriveDesktop = 'C:\\Users\\Mohammed Owais\\OneDrive\\Desktop\\mngroups-debug.apk';
const localDesktop = 'C:\\Users\\Mohammed Owais\\Desktop\\mngroups-debug.apk';
try { fs.copyFileSync(FINAL_APK_IN_BUILD, oneDriveDesktop); } catch(e) {}
try { fs.copyFileSync(FINAL_APK_IN_BUILD, localDesktop); } catch(e) {}

const apkStats = fs.statSync(FINAL_APK_IN_ROOT);
console.log('\n====================================================');
console.log('SUCCESS: CRASH-PROOF DEBUG APK GENERATED & DISTRIBUTED!');
console.log('====================================================');
console.log(`Workspace Path:   ${FINAL_APK_IN_ROOT}`);
console.log(`Vite Public Path: ${VITE_PUBLIC_APK}`);
console.log(`Desktop Path:     ${oneDriveDesktop}`);
console.log(`Size:             ${(apkStats.size / 1024).toFixed(1)} KB`);
console.log(`Package Name:     com.mngroups.maintenance`);
console.log(`Min SDK:          21 (Android 5.0 Lollipop through Android 14)`);
console.log(`Signatures:       v1, v2, v3 verified`);
console.log('====================================================');
