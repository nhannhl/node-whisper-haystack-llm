import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import axios from 'axios';

function App() {
  const TYPE = {
    'url': 'URL',
    'text': 'Text',
    'file': 'File Upload'
  };
  const WHISPER_TYPE = {
    'whisper-cpp': 'Whisper-cpp',
    'faster-whisper': 'Faster-whisper(with timestamp)',
    'whisper-x': 'WhisperX(with timestamp and speaker diarization)'
  };
  const API_SUMMARIZE_URL = import.meta.env.VITE_API_SUMMARIZE_URL;
  const API_DEEP_PROCESS_URL = import.meta.env.VITE_API_DEEP_PROCESS_URL;
  const API_RAG_URL = import.meta.env.VITE_API_RAG_URL;
  const API_DEEP_RAG_URL = import.meta.env.VITE_API_DEEP_RAG_URL;
  const [type, setType] = useState('url');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qaInput, setQaInput] = useState("");
  const [qaAnswer, setQaAnswer] = useState(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState(null);
  const [qaContext, setQaContext] = useState([]);
  const [whisperType, setWhisperType] = useState('whisper-cpp');
  const [timeTranscript, setTimeTranscript] = useState([]);
  const [timeTranscriptVisible, setTimeTranscriptVisible] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [audioPath, setAudioPath] = useState(null);

  useEffect(() => {
    setInputValue('');
    setSelectedFile(null);
    setSummary(null);
    setAudioPath(null);
    setError(null);
  }, [type]);

  useEffect(() => {
    setType('url');
  }, [whisperType]);

  const handleSummarize = async () => {
    console.log("handleSummarize");
    console.log(whisperType);
    setLoading(true);
    setError(null);
    setSummary(null);
    setAudioPath(null);
    setTimeTranscript([]);
    setTimeTranscriptVisible(false);

    try {
      let response;

      if (whisperType == 'whisper-cpp') {
        if (type === 'url') {
          if (!inputValue) {
            throw new Error("Please enter a URL.");
          }
          response = await axios.post(API_SUMMARIZE_URL, {
            type: 'url',
            url: inputValue,
          });
        } else if (type === 'text') {
          if (!inputValue) {
            throw new Error("Please enter some text.");
          }
          response = await axios.post(API_SUMMARIZE_URL, {
            type: 'lyrics',
            content: inputValue,
          });
        } else if (type === 'file') {
          if (!selectedFile) {
            throw new Error("Please select a file.");
          }
          const formData = new FormData();
          formData.append('type', 'video');
          formData.append('video', selectedFile);

          response = await axios.post(API_SUMMARIZE_URL, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else {
        if (!inputValue) {
          throw new Error("Please enter a URL.");
        }
        response = await axios.post(API_DEEP_PROCESS_URL, {
          type: whisperType,
          url: inputValue,
        });

        if (response.data.time_transcript) {
          setTimeTranscript(response.data.time_transcript);
        }
      }

      setSummary(response.data.summary);
      setAudioPath(response.data.audioPath);
      setVideoId(response.data.videoId);

    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.error || err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRagQuery = async () => {
    setQaLoading(true);
    setQaError(null);
    setQaAnswer(null);

    try {
      const url = whisperType == 'whisper-x' || whisperType == 'faster-whisper' ? API_DEEP_RAG_URL : API_RAG_URL;
      const response = await axios.post(url, {
        question: qaInput,
        videoId: videoId,
      });

      setQaAnswer(response.data.answer);
      setQaContext(response.data.context_chunks || []);
    } catch (err) {
      setQaError(err.response?.data?.error || err.message);
    } finally {
      setQaLoading(false);
    }
  };

  const highlightContext = (text, keyword) => {
    if (!keyword) return text;

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");

    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  const handleTimeTranscriptClick = () => {
    setTimeTranscriptVisible(!timeTranscriptVisible);
  };

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Summerize</h1>
      <div className="card">
        <div class="whisper-type">
          <span>Whisper type:</span>
          <select value={whisperType} onChange={(e) => setWhisperType(e.target.value)}>
            {Object.entries(WHISPER_TYPE).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        <div class="pick-type">
          <span>Pick Input Type:</span>
          {Object.entries(TYPE).map(([key, value]) => (
            <div key={key}>
              <input type="radio" id={key} name="type" value={key}
                disabled={whisperType == 'whisper-x' || whisperType == 'faster-whisper'}
                checked={type == key}
                onChange={(e) => setType(e.target.value)} />
              <label htmlFor={key}>{value}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="card card-input">
        {type == 'url' && <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter URL here" />}
        {type == 'text' && <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter text here"></textarea>}
        {type == 'file' && <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />}
      </div>
      <div className="card">
        <button onClick={handleSummarize} disabled={loading}>
          {loading ? 'Processing...' : 'Summarize'}
        </button>
      </div>
      {error && <div className="card error-message">Error: {error}</div>}
      {timeTranscript.length > 0 && (
        <div className="card time-transcript">
          <div className="time-transcript-header">
            <h2>Time Transcript</h2>
            <button onClick={handleTimeTranscriptClick}>View</button>
          </div>
          {timeTranscriptVisible && <div className="time-transcript-content">
            <ul>
              {timeTranscript.map((segment, index) => (
                <li key={index}>
                  <span>{(segment.speaker && `${segment.speaker} _ `) || ''}{segment.text}</span>
                  <span>{segment.start} - {segment.end}</span>
                </li>
              ))}
            </ul>
          </div>}
        </div>
      )}
      {summary && (
        <div className="card summary-result">
          <h2>Summary</h2>
          <p>{summary}</p>
          {audioPath && (
            <div className="audio-player" style={{ marginTop: '1rem' }}>
              <audio controls src={`${new URL(API_DEEP_PROCESS_URL).origin}${audioPath}`} style={{ width: '100%' }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      )}
      {/* ===================== RAG Q/A Section ===================== */}
      <div className="rag-card">
        <h2>Ask a Question (RAG)</h2>

        <textarea
          value={qaInput}
          onChange={(e) => setQaInput(e.target.value)}
          placeholder="Ask anything about the processed transcript…"
        ></textarea>

        <button
          onClick={handleRagQuery}
          disabled={qaLoading || !summary}
          className={!summary ? "disabled-btn" : ""}
        >
          {qaLoading ? "Searching…" : "Ask"}
        </button>

        {qaError && <div className="rag-error">Error: {qaError}</div>}

        {qaAnswer && (
          <div className="rag-answer">
            <h3>Answer</h3>
            <p>{qaAnswer}</p>
          </div>
        )}

        {qaContext.length > 0 && (
          <div className="rag-context">
            <h3>Context Used</h3>

            {qaContext.map((ctx, index) => (
              <div key={ctx.id} className="rag-chunk">
                <div className="rag-chunk-header">
                  <span>Chunk #{index + 1}</span>
                  <span className="score">Score: {ctx.score.toFixed(3)}</span>
                </div>

                <p
                  className="rag-chunk-text"
                  dangerouslySetInnerHTML={{
                    __html: highlightContext(ctx.content, qaInput),
                  }}
                ></p>
              </div>
            ))}
          </div>
        )}

      </div>

    </>
  )
}

export default App
