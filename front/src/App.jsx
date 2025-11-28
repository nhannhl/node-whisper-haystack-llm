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
  const API_SUMMARIZE_URL = import.meta.env.VITE_API_SUMMARIZE_URL;
  const API_RAG_URL = import.meta.env.VITE_API_RAG_URL;
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

  useEffect(() => {
    setInputValue('');
    setSelectedFile(null);
    setSummary(null);
    setError(null);
  }, [type]);

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      let response;

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

      setSummary(response.data.summary);

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
      const response = await axios.post(`${API_RAG_URL}`, {
        question: qaInput,
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
  }

  return (
    <>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Summerize</h1>
      <div className="card">
        <div class="pick-type">
          <span>Pick Input Type:</span>
          {Object.entries(TYPE).map(([key, value]) => (
            <div key={key}>
              <input type="radio" id={key} name="type" value={key} checked={type == key} onChange={(e) => setType((type) => e.target.value)}/>
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
      {summary && (
        <div className="card summary-result">
          <h2>Summary</h2>
          <p>{summary}</p>
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
