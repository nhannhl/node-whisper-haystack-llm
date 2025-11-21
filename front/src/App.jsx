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
  const API_URL = import.meta.env.VITE_API_URL;
  const [type, setType] = useState('url');
  const [inputValue, setInputValue] = useState(''); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        response = await axios.post(API_URL, {
          type: 'url',
          url: inputValue,
        });
      } else if (type === 'text') {
        if (!inputValue) {
          throw new Error("Please enter some text.");
        }
        response = await axios.post(API_URL, {
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

        response = await axios.post(API_URL, formData, {
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
    </>
  )
}

export default App
