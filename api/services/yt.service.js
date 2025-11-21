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


