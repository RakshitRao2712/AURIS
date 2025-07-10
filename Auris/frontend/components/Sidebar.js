import { useState } from 'react'
import Link from 'next/link'

export default function Sidebar({ isOpen, onClose, currentChat, setCurrentChat }) {
  const [chats, setChats] = useState([
    { id: 1, title: 'Getting started with React' },
    { id: 2, title: 'Python programming tips' },
    { id: 3, title: 'Travel recommendations' }
  ])
  
  const [showSettings, setShowSettings] = useState(false)

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New chat'
    }
    setChats([newChat, ...chats])
    setCurrentChat(newChat)
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 ${isOpen ? 'block' : 'hidden'}`} 
           onClick={onClose} />
      
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                      w-64 bg-gray-900 text-white z-30 transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="p-4">
          <button 
            onClick={createNewChat}
            className="w-full border border-gray-600 rounded-md py-2 px-4 text-sm flex items-center justify-center hover:bg-gray-700 transition"
          >
            <span>+ New chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setCurrentChat(chat)}
              className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-800 ${currentChat?.id === chat.id ? 'bg-gray-800' : ''}`}
            >
              {chat.title}
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 w-full p-2 rounded-md hover:bg-gray-800"
          >
            <span>Settings</span>
          </button>
        </div>
      </div>
    </>
  )
}