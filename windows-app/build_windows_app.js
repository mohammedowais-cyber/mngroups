const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

console.log('====================================================');
console.log('MN GROUPS - NATIVE WINDOWS DESKTOP APP BUILDER');
console.log('====================================================');

const WORKSPACE_DIR = path.resolve(__dirname, '..');
const WINDOWS_APP_DIR = __dirname;
const CSC = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';

if (!fs.existsSync(WINDOWS_APP_DIR)) {
  fs.mkdirSync(WINDOWS_APP_DIR, { recursive: true });
}

// 1. Generate high-quality PNG icon
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

function generateIconPng(width, height) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  const radius = width / 2;
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      // Outer border / shield
      const isRing = (dist >= radius * 0.74 && dist <= radius * 0.92);
      const isInner = (x >= width * 0.28 && x <= width * 0.72 && y >= height * 0.26 && y <= height * 0.74);
      const isCenter = (x >= width * 0.44 && x <= width * 0.56 && y >= height * 0.36 && y <= height * 0.64);

      if (isRing || (isInner && !isCenter)) {
        rawData[offset++] = 0xB8; // Gold R
        rawData[offset++] = 0x90; // Gold G
        rawData[offset++] = 0x2E; // Gold B
        rawData[offset++] = 0xFF; // A
      } else {
        rawData[offset++] = 0x0F; // Navy R
        rawData[offset++] = 0x1B; // Navy G
        rawData[offset++] = 0x33; // Navy B
        rawData[offset++] = 0xFF; // A
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

// Wrap PNG inside standard Windows .ico format
function createIcoFile(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = Icon
  header.writeUInt16LE(1, 4); // 1 Image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
  entry.writeUInt8(0, 2); // Colors
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Planes
  entry.writeUInt16LE(32, 6); // BPP
  entry.writeUInt32LE(pngBuffer.length, 8); // Size of image
  entry.writeUInt32LE(22, 12); // Offset (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer]);
}

const iconPng = generateIconPng(48, 48);
const iconIco = createIcoFile(iconPng, 48);
const icoPath = path.join(WINDOWS_APP_DIR, 'app.ico');
fs.writeFileSync(icoPath, iconIco);
console.log('[1/4] Generated native Windows app.ico');

// 2. Write C# Application Source Code
const csPath = path.join(WINDOWS_APP_DIR, 'Program.cs');
const csSource = `
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace MNGroups {
    static class Program {
        [STAThread]
        static void Main() {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = @"${WORKSPACE_DIR.replace(/\\/g, '\\\\')}";
            string webUrl = "http://localhost:3000/";
            string fallbackFile = Path.Combine(appDir, @"reference\\mn-groups-app.html");

            // 1. Check if local dev server on port 3000 is running
            bool serverOnline = false;
            try {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://localhost:3000/");
                req.Timeout = 1200;
                req.Method = "HEAD";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse()) {
                    if (res.StatusCode == HttpStatusCode.OK) {
                        serverOnline = true;
                    }
                }
            } catch {
                serverOnline = false;
            }

            // 2. If not online, attempt to start servers silently
            if (!serverOnline) {
                try {
                    string startCmd = Path.Combine(appDir, "backend\\\\start_server.cmd");
                    if (File.Exists(startCmd)) {
                        ProcessStartInfo psiServer = new ProcessStartInfo("cmd.exe", "/c \\"" + startCmd + "\\"");
                        psiServer.WorkingDirectory = Path.Combine(appDir, "backend");
                        psiServer.WindowStyle = ProcessWindowStyle.Hidden;
                        psiServer.CreateNoWindow = true;
                        Process.Start(psiServer);
                    }
                } catch {}
            }

            // Target URL: if server is ready or fallback to self-contained reference app
            string targetUrl = serverOnline ? webUrl : (File.Exists(fallbackFile) ? "file:///" + fallbackFile.Replace('\\\\', '/') : webUrl);

            // 3. Find Edge or Chrome to run in dedicated standalone app mode
            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\\Edge\\Application\\msedge.exe");
            if (!File.Exists(edge)) {
                edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\\Edge\\Application\\msedge.exe");
            }

            string chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\\Chrome\\Application\\chrome.exe");
            if (!File.Exists(chrome)) {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\\Chrome\\Application\\chrome.exe");
            }
            if (!File.Exists(chrome)) {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\\Chrome\\Application\\chrome.exe");
            }

            ProcessStartInfo psi = null;
            if (File.Exists(edge)) {
                psi = new ProcessStartInfo(edge, "--app=\\"" + targetUrl + "\\" --window-size=1366,850");
            } else if (File.Exists(chrome)) {
                psi = new ProcessStartInfo(chrome, "--app=\\"" + targetUrl + "\\" --window-size=1366,850");
            } else {
                psi = new ProcessStartInfo(targetUrl);
                psi.UseShellExecute = true;
            }

            try {
                Process.Start(psi);
            } catch (Exception ex) {
                MessageBox.Show("Could not launch application: " + ex.Message, "MN Groups Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
`;
fs.writeFileSync(csPath, csSource, 'utf8');
console.log('[2/4] Created C# Program.cs');

// 3. Compile with csc.exe into native Windows executable
const outExeInWindowsApp = path.join(WINDOWS_APP_DIR, 'MN-Groups.exe');
const outExeInRoot = path.join(WORKSPACE_DIR, 'MN-Groups.exe');
const desktopOneDrive = 'C:\\Users\\Mohammed Owais\\OneDrive\\Desktop\\MN-Groups.exe';
const desktopLocal = 'C:\\Users\\Mohammed Owais\\Desktop\\MN-Groups.exe';

console.log('[3/4] Compiling native Windows GUI executable via csc.exe...');
const compileCmd = `"${CSC}" /target:winexe /win32icon:"${icoPath}" /out:"${outExeInWindowsApp}" "${csPath}"`;
execSync(compileCmd, { stdio: 'inherit' });

console.log('[4/4] Distributing MN-Groups.exe...');
fs.copyFileSync(outExeInWindowsApp, outExeInRoot);
try { fs.copyFileSync(outExeInWindowsApp, desktopOneDrive); console.log('   -> Copied to OneDrive Desktop:', desktopOneDrive); } catch(e) {}
try { fs.copyFileSync(outExeInWindowsApp, desktopLocal); console.log('   -> Copied to Local Desktop:', desktopLocal); } catch(e) {}

const exeStats = fs.statSync(outExeInRoot);
console.log('\n====================================================');
console.log('SUCCESS: NATIVE WINDOWS APPLICATION CREATED!');
console.log('====================================================');
console.log(`Executable: ${outExeInRoot}`);
console.log(`Desktop:    ${desktopOneDrive}`);
console.log(`Size:       ${(exeStats.size / 1024).toFixed(1)} KB`);
console.log(`Type:       Native Windows GUI Executable (.exe)`);
console.log(`Icon:       MN Groups Gold & Navy Shield embedded`);
console.log('====================================================');
