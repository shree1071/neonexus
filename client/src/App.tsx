import { useState, useEffect } from 'react'
import TutorSidebar from './components/TutorSidebar'

function App() {
  const [latestExplanation, setLatestExplanation] = useState<string | null>(null);

  // Listen for analysis results coming from the content script (which drew on the active tab)
  useEffect(() => {
    const messageListener = (request: any) => {
      if (request.action === 'analysis_complete' && request.data.explanation) {
        setLatestExplanation(request.data.explanation);
      }
    };
    
    // Check if chrome.runtime is available (it won't be during standard Vite local dev)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
    }
    
    return () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    }
  }, []);

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col font-sans overflow-hidden text-slate-100">
      <TutorSidebar latestExplanation={latestExplanation} />
    </div>
  )
}

export default App
