
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

            string appDir = @"C:\\Users\\Mohammed Owais\\Downloads\\MN Groups";
            string webUrl = "http://localhost:3000/";
            string fallbackFile = Path.Combine(appDir, @"reference\mn-groups-app.html");

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
                    string startCmd = Path.Combine(appDir, "backend\\start_server.cmd");
                    if (File.Exists(startCmd)) {
                        ProcessStartInfo psiServer = new ProcessStartInfo("cmd.exe", "/c \"" + startCmd + "\"");
                        psiServer.WorkingDirectory = Path.Combine(appDir, "backend");
                        psiServer.WindowStyle = ProcessWindowStyle.Hidden;
                        psiServer.CreateNoWindow = true;
                        Process.Start(psiServer);
                    }
                } catch {}
            }

            // Target URL: if server is ready or fallback to self-contained reference app
            string targetUrl = serverOnline ? webUrl : (File.Exists(fallbackFile) ? "file:///" + fallbackFile.Replace('\\', '/') : webUrl);

            // 3. Find Edge or Chrome to run in dedicated standalone app mode
            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edge)) {
                edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            string chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            if (!File.Exists(chrome)) {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
            }
            if (!File.Exists(chrome)) {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe");
            }

            ProcessStartInfo psi = null;
            if (File.Exists(edge)) {
                psi = new ProcessStartInfo(edge, "--app=\"" + targetUrl + "\" --window-size=1366,850");
            } else if (File.Exists(chrome)) {
                psi = new ProcessStartInfo(chrome, "--app=\"" + targetUrl + "\" --window-size=1366,850");
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
