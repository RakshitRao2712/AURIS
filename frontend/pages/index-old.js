import { useState } from 'react';
import Navbar from '../components/Navbar'; // Fixed casing to match actual file
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import InputArea from '../components/InputArea'; // Added import

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area with space for InputArea */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        
        {/* Chat area with padding for input */}
        <div className="flex-1 overflow-y-auto pb-24"> 
          <ChatArea />
        </div>
        
        {/* Fixed input area at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <InputArea />
        </div>
      </div>
    </div>
  );
}