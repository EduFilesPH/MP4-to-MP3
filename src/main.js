import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import './styles.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="page-shell">
    <header class="hero">
      <div class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l11-2v13" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2.1"/>
          <circle cx="17" cy="16" r="3" stroke="currentColor" stroke-width="2.1"/>
        </svg>
      </div>
      <div>
        <p class="eyebrow">Browser-based audio converter</p>
        <h1>MP4 to MP3 Converter</h1>
        <p class="hero-copy">Extract audio from your video and save it as an MP3. Your media stays in your browser.</p>
      </div>
    </header>

    <section class="converter-card" aria-labelledby="converter-heading">
      <div class="step-strip">
        <div class="step is-active" data-step="1"><span>1</span><strong>Choose video</strong></div>
        <div class="step" data-step="2"><span>2</span><strong>Convert</strong></div>
        <div class="step" data-step="3"><span>3</span><strong>Download</strong></div>
      </div>

      <div class="card-body">
        <div class="privacy-note">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke="currentColor" stroke-width="2"/>
            <path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>
            <strong>Private, client-side conversion</strong>
            <p>The selected file is processed in this browser and is not uploaded to this website.</p>
          </div>
        </div>

        <label class="drop-zone" id="dropZone" for="fileInput">
          <input id="fileInput" type="file" accept="video/*,.mp4,.m4v,.mov,.webm,.mkv,.avi" hidden />
          <div class="upload-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 id="converter-heading">Drop a video here</h2>
          <p>or click to browse your device</p>
          <span class="file-hint">MP4, M4V, MOV, WebM, MKV and other FFmpeg-supported video formats</span>
        </label>

        <div class="selected-file" id="selectedFile" hidden>
          <div class="file-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="13" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="m16 10 5-3v10l-5-3v-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="file-info">
            <strong id="fileName"></strong>
            <span id="fileMeta"></span>
          </div>
          <button type="button" class="icon-button" id="removeFile" aria-label="Remove selected file">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="options-grid">
          <label class="field">
            <span>MP3 quality</span>
            <select id="bitrate">
              <option value="128k">128 kbps — Standard</option>
              <option value="192k" selected>192 kbps — Good</option>
              <option value="256k">256 kbps — High</option>
              <option value="320k">320 kbps — Maximum</option>
            </select>
          </label>

          <label class="field">
            <span>Track title <small>optional</small></span>
            <input id="trackTitle" type="text" maxlength="120" placeholder="Use video filename" />
          </label>

          <label class="field">
            <span>Artist <small>optional</small></span>
            <input id="artistName" type="text" maxlength="120" placeholder="Artist name" />
          </label>
        </div>

        <button type="button" class="convert-button" id="convertButton" disabled>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Convert to MP3</span>
        </button>

        <div class="progress-panel" id="progressPanel" hidden aria-live="polite">
          <div class="progress-heading">
            <strong id="progressTitle">Preparing converter…</strong>
            <span id="progressPercent">0%</span>
          </div>
          <div class="progress-track" aria-hidden="true"><div id="progressBar"></div></div>
          <p id="progressStatus">Starting…</p>
        </div>

        <div class="error-message" id="errorMessage" hidden role="alert"></div>

        <div class="result-panel" id="resultPanel" hidden>
          <div class="result-heading">
            <div class="success-mark" aria-hidden="true">✓</div>
            <div>
              <strong>Your MP3 is ready</strong>
              <p id="resultMeta"></p>
            </div>
          </div>
          <audio id="audioPreview" controls></audio>
          <a class="download-button" id="downloadButton" href="#" download>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Download MP3
          </a>
        </div>

        <p class="rights-note">Use only video or audio content you own or have permission to convert.</p>
      </div>
    </section>

    <footer>
      <span>Powered by ffmpeg.wasm</span>
      <span aria-hidden="true">•</span>
      <span>No media upload required</span>
    </footer>
  </main>
`;

const $ = (selector) => document.querySelector(selector);

const fileInput = $('#fileInput');
const dropZone = $('#dropZone');
const selectedFilePanel = $('#selectedFile');
const fileName = $('#fileName');
const fileMeta = $('#fileMeta');
const removeFileButton = $('#removeFile');
const bitrate = $('#bitrate');
const trackTitle = $('#trackTitle');
const artistName = $('#artistName');
const convertButton = $('#convertButton');
const progressPanel = $('#progressPanel');
const progressTitle = $('#progressTitle');
const progressPercent = $('#progressPercent');
const progressBar = $('#progressBar');
const progressStatus = $('#progressStatus');
const errorMessage = $('#errorMessage');
const resultPanel = $('#resultPanel');
const resultMeta = $('#resultMeta');
const audioPreview = $('#audioPreview');
const downloadButton = $('#downloadButton');

let selectedFile = null;
let ffmpeg = null;
let ffmpegLoaded = false;
let outputUrl = null;

const MAX_FILE_SIZE = 750 * 1024 * 1024;
const CORE_BASE_URL = '/ffmpeg';
const FFMPEG_LOAD_TIMEOUT_MS = 45000;

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function safeBaseName(name) {
  return (name || 'audio')
    .replace(/\.[^/.]+$/, '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .trim()
    .slice(0, 120) || 'audio';
}

function setStep(active) {
  document.querySelectorAll('.step').forEach((step) => {
    const number = Number(step.dataset.step);
    step.classList.toggle('is-active', number === active);
    step.classList.toggle('is-done', number < active);
    step.querySelector('span').textContent = number < active ? '✓' : String(number);
  });
}

function setProgress(percent, title, status) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  progressBar.style.width = `${value}%`;
  progressPercent.textContent = `${value}%`;
  if (title) progressTitle.textContent = title;
  if (status) progressStatus.textContent = status;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.hidden = true;
}

function clearResult() {
  resultPanel.hidden = true;
  if (outputUrl) {
    URL.revokeObjectURL(outputUrl);
    outputUrl = null;
  }
  audioPreview.removeAttribute('src');
  audioPreview.load();
}

function selectFile(file) {
  clearError();
  clearResult();

  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    showError('This file is larger than 750 MB. Browser-based conversion may run out of memory. Please choose a smaller file.');
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileMeta.textContent = `${formatBytes(file.size)}${file.type ? ` • ${file.type}` : ''}`;
  selectedFilePanel.hidden = false;
  convertButton.disabled = false;

  if (!trackTitle.value.trim()) {
    trackTitle.value = safeBaseName(file.name);
  }

  setStep(1);
}

function resetSelection() {
  selectedFile = null;
  fileInput.value = '';
  selectedFilePanel.hidden = true;
  convertButton.disabled = true;
  progressPanel.hidden = true;
  clearError();
  clearResult();
  setStep(1);
}

async function loadFFmpeg() {
  if (ffmpegLoaded && ffmpeg) return;

  setProgress(5, 'Loading conversion engine…', 'Downloading FFmpeg components. This is only needed once per browser session.');

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    if (message) {
      progressStatus.textContent = message.length > 150 ? `${message.slice(0, 147)}…` : message;
    }
  });

  ffmpeg.on('progress', ({ progress }) => {
    if (!Number.isFinite(progress)) return;
    const mapped = 15 + progress * 85;
    setProgress(mapped, 'Converting to MP3…', 'Extracting and encoding the audio track.');
  });

  const coreURL = new URL(`${CORE_BASE_URL}/ffmpeg-core.js`, window.location.origin).href;
  const wasmURL = new URL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, window.location.origin).href;

  setProgress(12, 'Loading conversion engine…', 'Starting the local WebAssembly audio engine.');

  let timeoutId;
  try {
    await Promise.race([
      ffmpeg.load({ coreURL, wasmURL }),
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(
          () => reject(new Error('FFmpeg initialization timed out. Please refresh the page and try again.')),
          FFMPEG_LOAD_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }

  ffmpegLoaded = true;
}

async function convertToMp3() {
  if (!selectedFile) return;

  clearError();
  clearResult();
  convertButton.disabled = true;
  progressPanel.hidden = false;
  setStep(2);
  setProgress(0, 'Preparing converter…', 'Initializing…');

  const sourceExtension = (selectedFile.name.split('.').pop() || 'mp4').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'mp4';
  const inputName = `input.${sourceExtension}`;
  const outputName = 'output.mp3';
  const quality = bitrate.value;
  const title = trackTitle.value.trim();
  const artist = artistName.value.trim();

  try {
    await loadFFmpeg();

    setProgress(15, 'Reading video…', 'Loading the selected file into the converter.');
    await ffmpeg.writeFile(inputName, await fetchFile(selectedFile));

    const args = [
      '-i', inputName,
      '-vn',
      '-codec:a', 'libmp3lame',
      '-b:a', quality,
    ];

    if (title) args.push('-metadata', `title=${title}`);
    if (artist) args.push('-metadata', `artist=${artist}`);
    args.push('-y', outputName);

    setProgress(18, 'Converting to MP3…', 'Extracting and encoding the audio track.');
    const exitCode = await ffmpeg.exec(args);

    if (exitCode !== 0) {
      throw new Error(`FFmpeg stopped with exit code ${exitCode}.`);
    }

    const data = await ffmpeg.readFile(outputName);
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const blob = new Blob([bytes], { type: 'audio/mpeg' });

    outputUrl = URL.createObjectURL(blob);
    const outputNameForDownload = `${safeBaseName(title || selectedFile.name)}.mp3`;

    audioPreview.src = outputUrl;
    downloadButton.href = outputUrl;
    downloadButton.download = outputNameForDownload;
    resultMeta.textContent = `${outputNameForDownload} • ${formatBytes(blob.size)} • ${quality}`;
    resultPanel.hidden = false;

    setProgress(100, 'Conversion complete', 'Your MP3 is ready.');
    setStep(3);

    try { await ffmpeg.deleteFile(inputName); } catch {}
    try { await ffmpeg.deleteFile(outputName); } catch {}
  } catch (error) {
    console.error(error);
    setStep(1);
    showError(
      'Conversion could not be completed. Refresh the page and try again. ' +
      (error?.message || '')
    );
    setProgress(0, 'Conversion stopped', 'Please review the error below.');
  } finally {
    convertButton.disabled = !selectedFile;
  }
}

fileInput.addEventListener('change', () => selectFile(fileInput.files?.[0]));

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
  });
});

dropZone.addEventListener('drop', (event) => {
  selectFile(event.dataTransfer?.files?.[0]);
});

removeFileButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  resetSelection();
});

convertButton.addEventListener('click', convertToMp3);
