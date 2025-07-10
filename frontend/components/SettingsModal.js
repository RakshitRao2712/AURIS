export default function SettingsModal({ isOpen, onClose }) {
    if (!isOpen) return null
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Theme</h3>
              <div className="flex space-x-4">
                <button className="p-2 border border-gray-300 rounded-md">Light</button>
                <button className="p-2 border border-gray-300 rounded-md bg-gray-800 text-white">Dark</button>
                <button className="p-2 border border-gray-300 rounded-md">System</button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Clear all chats</h3>
              <button className="text-red-500 hover:text-red-700 text-sm">
                Clear all conversations
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }