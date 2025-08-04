import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [testData, setTestData] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetch('/api/test-data')
      .then(res => res.json())
      .then(data => {
        setTestData(data);
        if (data.slugs.length > 0) setSelectedSlug(data.slugs[0]);
        if (data.usernames.length > 0) setSelectedUsername(data.usernames[0]);
        if (data.images.length > 0) setSelectedImage(data.images[0]);
      })
      .catch(err => console.error('Failed to fetch test data:', err));
  }, []);


  const generateTestUrl = async () => {
    if (!selectedSlug || !selectedUsername || !selectedImage) {
      alert('Please select all options');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: selectedSlug,
          username: selectedUsername,
          imageIndex: testData.images.indexOf(selectedImage)
        })
      });

      const result = await response.json();
      setGeneratedUrl(result.url);
      
      fetchPreviewData(result.url);
      
    } catch (error) {
      console.error('Error generating URL:', error);
      alert('Failed to generate URL');
    } finally {
      setIsLoading(false);
    }
  };


  const fetchPreviewData = async (url) => {
    try {
      const response = await fetch(`/api/preview-data?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error('Error fetching preview data:', error);
    }
  };

  const testTwitterShare = (url) => {
    const tweetText = `Testing OG image preview for dynamic URL: ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    const testResult = {
      id: Date.now(),
      url: url,
      timestamp: new Date().toISOString(),
      status: 'attempted'
    };
    
    setTestResults(prev => [testResult, ...prev.slice(0, 9)]);
    
    window.open(twitterUrl, '_blank');
  };

  const testCardValidator = (url) => {
    const validatorUrl = `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`;
    window.open(validatorUrl, '_blank');
  };


  const preWarmUrl = async (url) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pre-warm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('URL pre-warmed successfully! Wait 10-15 seconds before sharing.');
      } else {
        alert('Pre-warming failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error pre-warming URL:', error);
      alert('Pre-warming failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!testData) {
    return (
      <div className="App">
        <div className="loading">Loading test data...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐦 Twitter OG Preview Tester</h1>
        <p>Test dynamic URL Twitter card previews</p>
      </header>

      <main className="App-main">
        <section className="generator-section">
          <h2>🔧 Generate Test URL</h2>
          
          <div className="form-group">
            <label>Slug:</label>
            <select 
              value={selectedSlug} 
              onChange={(e) => setSelectedSlug(e.target.value)}
            >
              {testData.slugs.map(slug => (
                <option key={slug} value={slug}>{slug}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Username:</label>
            <select 
              value={selectedUsername} 
              onChange={(e) => setSelectedUsername(e.target.value)}
            >
              {testData.usernames.map(username => (
                <option key={username} value={username}>{username}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Image Preview:</label>
            <select 
              value={selectedImage} 
              onChange={(e) => setSelectedImage(e.target.value)}
            >
              {testData.images.map((image, index) => (
                <option key={image} value={image}>Image {index + 1}</option>
              ))}
            </select>
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="image-preview"
              />
            )}
          </div>

          <button 
            onClick={generateTestUrl} 
            disabled={isLoading}
            className="generate-btn"
          >
            {isLoading ? 'Generating...' : '🎯 Generate New Test URL'}
          </button>
        </section>

        {generatedUrl && (
          <section className="url-section">
            <h2>🔗 Generated URL</h2>
            <div className="url-display">
              <input 
                type="text" 
                value={generatedUrl} 
                readOnly 
                className="url-input"
              />
              <button 
                onClick={() => navigator.clipboard.writeText(generatedUrl)}
                className="copy-btn"
              >
                📋 Copy
              </button>
            </div>

            {previewData && (
              <div className="preview-data">
                <h3>📊 OG Meta Data</h3>
                <div className="meta-info">
                  <p><strong>Title:</strong> {previewData.title}</p>
                  <p><strong>Description:</strong> {previewData.description}</p>
                  <p><strong>Image:</strong> {previewData.image}</p>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button 
                onClick={() => testTwitterShare(generatedUrl)}
                className="twitter-btn"
              >
                🐦 Test on Twitter
              </button>
              
              <button 
                onClick={() => testCardValidator(generatedUrl)}
                className="validator-btn"
              >
                🔍 Twitter Card Validator
              </button>
              
              <button 
                onClick={() => preWarmUrl(generatedUrl)}
                disabled={isLoading}
                className="prewarm-btn"
              >
                🔥 Pre-warm URL
              </button>
              
              <button 
                onClick={() => window.open(generatedUrl, '_blank')}
                className="view-btn"
              >
                👁️ View Landing Page
              </button>
            </div>
          </section>
        )}

        {testResults.length > 0 && (
          <section className="results-section">
            <h2>📈 Test History</h2>
            <div className="results-list">
              {testResults.map(result => (
                <div key={result.id} className="result-item">
                  <div className="result-url">{result.url}</div>
                  <div className="result-time">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                  <div className={`result-status ${result.status}`}>
                    {result.status}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="instructions-section">
          <h2>📋 Testing Instructions</h2>
          <ol>
            <li><strong>Generate URL:</strong> Select options and click "Generate New Test URL"</li>
            <li><strong>Test Method 1:</strong> Click "Test on Twitter" - check if image preview appears immediately</li>
            <li><strong>Test Method 2:</strong> Use "Twitter Card Validator" to manually validate</li>
            <li><strong>Pre-warming:</strong> Use "Pre-warm URL" before sharing for better results</li>
            <li><strong>Compare:</strong> Test same URL multiple times to see consistency</li>
          </ol>
          

        </section>
      </main>
    </div>
  );
}

export default App;
