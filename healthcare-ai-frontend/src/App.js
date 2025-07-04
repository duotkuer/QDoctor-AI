import React, { useState, useEffect, useRef } from 'react';

// --- SVG Icons ---
const UploadIcon = ({ style }) => (
  <svg style={style} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const SendIcon = ({ style }) => (
  <svg style={style} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const DocumentIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px', flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);


// --- Main App Component ---
function App() {
  // --- All state and ref declarations are now correctly placed here ---
  const [documents, setDocuments] = useState([]);
  const [fetchStatus, setFetchStatus] = useState('loading'); // Renamed from 'status'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null); // Correctly defined with useRef

  // --- Backend Integration ---
  useEffect(() => {
    const fetchDocuments = async () => {
      const API_ENDPOINT = 'http://localhost:8000/documents';

      try {
        const response = await fetch(API_ENDPOINT);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDocuments(data);
        setFetchStatus('success');
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        // Set some example documents on error so the app is still usable for demo
        setDocuments([
            "Kenya Mental Health plan (Error)",
            "Kenya Mental Health Policy (Error)",
            "National Protocol for Substance Use (Error)",
        ]);
        setFetchStatus('error');
      }
    };

    fetchDocuments();
  }, []); // Empty dependency array means this runs once on component mount

  const handleDocSelect = (docName) => {
    setSelectedDoc(docName);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDoc(file.name);
      // Here you would typically handle the file upload to the backend
    }
  };

  const handleSend = async () => {
    if (!isChatActive || !chatInput.trim()) return;
    const userMessage = { type: 'user', text: chatInput };
    setMessages(prev => [...prev, userMessage]);
    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: selectedDoc,
          query: chatInput
        })
      });
      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      const aiMessage = { type: 'system', text: data.answer };
      setMessages(prev => [...prev, aiMessage]);
      setChatInput('');
    } catch (err) {
      setMessages(prev => [...prev, { type: 'system', text: 'Error communicating with backend.' }]);
    }
  };

  const isChatActive = selectedDoc !== null;

  return (
    <div style={styles.appContainer}>
      <style>{`
        .doc-item:hover { background-color: #e9e9e9; }
        .icon-button:hover svg { color: #5e2d9a; }
        ::placeholder { color: #999; }
        input:disabled { background-color: #f8f9fa !important; cursor: not-allowed; }
      `}</style>
      {/* --- Left Sidebar --- */}
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>DOCUMENTS</h2>
        <div style={styles.docList}>
          {fetchStatus === 'loading' && <p style={styles.statusText}>Loading documents...</p>}
          {fetchStatus === 'error' && <p style={styles.statusText}>Failed to load documents. Using examples.</p>}
          {fetchStatus === 'success' && documents.map((doc) => (
            <div
              key={doc.id}
              className="doc-item"
              style={selectedDoc === doc.id ? {...styles.docItem, ...styles.docItemSelected} : styles.docItem}
              onClick={() => handleDocSelect(doc.id)}
            >
              <DocumentIcon/>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- Right Main Content --- */}
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h1 style={styles.mainTitle}>QDOCTOR AI</h1>
          <p style={styles.subtitle}>Your Intelligent Healthcare Assistant</p>
        </header>

        <div style={styles.chatArea}>
            { !isChatActive &&
                <div style={styles.welcomeMessage}>
                    <h2>Welcome!</h2>
                    <p>Select a document from the list on the left or upload your own to begin.</p>
                </div>
            }
            <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  padding: '10px 0',
  minHeight: '200px'
}}>
  {messages.map((msg, idx) => (
    <div
      key={idx}
      style={{
        alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
        background: msg.type === 'user' ? '#f0ebf9' : '#f8f9fa',
        color: msg.type === 'user' ? '#5e2d9a' : '#222',
        borderRadius: '8px',
        padding: '10px 16px',
        margin: '6px 0',
        maxWidth: '80%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      {msg.text}
    </div>
  ))}
</div>
        </div>

        {/* --- Chat Input Area --- */}
        <div style={styles.inputWrapper}>
            <div style={{...styles.inputArea, backgroundColor: isChatActive ? '#fff' : '#f8f9fa'}}>
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isChatActive ? `Ask anything about ${documents.find(d => d.id === selectedDoc)?.name || ''}` : "Select a document to activate chat"}
                    style={styles.textInput}
                    disabled={!isChatActive}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSend();
                    }}
                />
                <input
                    type="file"
                    ref={fileInputRef} // Correctly uses fileInputRef
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button className="icon-button" style={styles.iconButton} onClick={handleFileUploadClick}>
                    <UploadIcon style={{ color: '#555' }} />
                </button>
                <button
  className="icon-button"
  style={styles.iconButton}
  disabled={!isChatActive || !chatInput}
  onClick={handleSend}
>
  <SendIcon style={{ color: (!isChatActive || !chatInput) ? '#aaa' : '#555' }} />
</button>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- Styles (No Changes) ---
const styles = {
  appContainer: {
    display: 'flex',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  sidebar: {
    width: '380px',
    backgroundColor: '#fff',
    padding: '25px',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '20px',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px'
  },
  docList: {
    overflowY: 'auto',
    flex: 1,
  },
  statusText: {
    color: '#666',
    fontSize: '14px',
    padding: '10px'
  },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    cursor: 'pointer',
    color: '#444',
    fontSize: '14px',
    padding: '12px',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease-in-out',
  },
  docItemSelected: {
    backgroundColor: '#f0ebf9',
    color: '#5e2d9a',
    fontWeight: 600,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '25px 40px',
    height: '100vh', // Make the main area fill the viewport
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    padding: '10px 0 30px 0',
    flex: 'none', // Prevent header from growing/shrinking
  },
  mainTitle: {
    color: '#5e2d9a',
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    color: '#555',
    fontSize: '16px',
    marginTop: '5px',
  },
  chatArea: {
    flex: 1,
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'auto', // Enable vertical scroll
    minHeight: 0,      // Required for flexbox scrolling
    background: 'transparent',
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#777',
  },
  inputWrapper: {
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
    flex: 'none', // Prevent input bar from growing/shrinking
  },
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: '12px',
    padding: '5px 10px',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  textInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: 'transparent',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    marginLeft: '5px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  }
};

export default App;