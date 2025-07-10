import Message from './Message'
import InputArea from './InputArea'

export default function ChatArea({ messages, currentChat }) {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      {!currentChat ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">AURIS</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Your AI-powered assistant</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
            <div className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Explain quantum computing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">in simple terms</p>
            </div>
            <div className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Got any creative ideas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">for a 10 year old's birthday?</p>
            </div>
            <div className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">How do I make an HTTP request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">in JavaScript?</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">{currentChat.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">Start a conversation with ChatGPT</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <Message key={index} message={message} />
              ))
            )}
          </div>
          <InputArea />
        </>
      )}
    </div>
  )
}