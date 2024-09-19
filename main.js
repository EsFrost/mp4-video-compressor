const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("select-file", async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "MP4", extensions: ["mp4"] }],
  });

  if (!result.canceled) {
    event.reply("file-selected", result.filePaths[0]);
  }
});

ipcMain.on("compress-video", (event, filePath) => {
  const outputPath = path.join(
    path.dirname(filePath),
    `compressed_${path.basename(filePath)}`
  );

  ffmpeg(filePath)
    .videoCodec("libx264")
    .outputOptions(["-crf 28"])
    .on("progress", (progress) => {
      event.reply("compression-progress", progress.percent);
    })
    .on("end", () => {
      event.reply("compression-complete", outputPath);
    })
    .on("error", (err) => {
      event.reply("compression-error", err.message);
    })
    .save(outputPath);
});
