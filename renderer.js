const { ipcRenderer } = require("electron");

const selectFileBtn = document.getElementById("selectFile");
const compressVideoBtn = document.getElementById("compressVideo");
const selectedFileElement = document.getElementById("selectedFile");
const progressElement = document.getElementById("progress");

let selectedFilePath = null;

selectFileBtn.addEventListener("click", () => {
  ipcRenderer.send("select-file");
});

compressVideoBtn.addEventListener("click", () => {
  if (selectedFilePath) {
    ipcRenderer.send("compress-video", selectedFilePath);
    progressElement.textContent = "Compression started...";
  }
});

ipcRenderer.on("file-selected", (event, filePath) => {
  selectedFilePath = filePath;
  selectedFileElement.textContent = `Selected file: ${filePath}`;
  compressVideoBtn.disabled = false;
});

ipcRenderer.on("compression-progress", (event, percent) => {
  progressElement.textContent = `Compression progress: ${percent.toFixed(2)}%`;
});

ipcRenderer.on("compression-complete", (event, outputPath) => {
  progressElement.textContent = `Compression complete! Output file: ${outputPath}`;
});

ipcRenderer.on("compression-error", (event, errorMessage) => {
  progressElement.textContent = `Compression error: ${errorMessage}`;
});
