import { exec } from "child_process";

export function downloadWithYtDlp(url, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `yt-dlp -f mp4 -o "${outputPath}" "${url}"`;
    console.log("Running:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function downloadAudioWithYtDlp(url, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;
    console.log("Running:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function downloadSubtitleWithYtDlp(url, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "${outputPath}" "${url}"`;

    console.log("Running:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function downloadWithYtDlpByQuanlity(url, outputPath, quality = 720) {
  return new Promise((resolve, reject) => {
    // Format: best video up to quality + best audio, fallback to best combined format
    const formatSelector = `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]/best`;
    const cmd = `yt-dlp -f "${formatSelector}" --merge-output-format mp4 --audio-multistreams -o "${outputPath}" "${url}"`;
    console.log("Running:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}


