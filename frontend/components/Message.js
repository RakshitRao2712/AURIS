import { useState, useEffect } from 'react';

export default function Message({ message, onCopy }) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleLike = () => {
      if (disliked) setDisliked(false);
      setLiked(!liked);
      console.log('👍 Message liked:', message.content.substring(0, 50) + '...');
    };

    const handleDislike = () => {
      if (liked) setLiked(false);
      setDisliked(!disliked);
      console.log('👎 Message disliked:', message.content.substring(0, 50) + '...');
    };

    // Typewriter effect for AI responses
    useEffect(() => {
      if (message.role === 'assistant') {
        setIsTyping(true);
        setDisplayedText('');
        
        let index = 0;
        const timer = setInterval(() => {
          if (index < message.content.length) {
            setDisplayedText((prev) => prev + message.content.charAt(index));
            index++;
          } else {
            setIsTyping(false);
            clearInterval(timer);
          }
        }, 30); // Adjust speed here (lower = faster)
        
        return () => clearInterval(timer);
      } else {
        setDisplayedText(message.content);
      }
    }, [message.content, message.role]);

    return (
      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm border ${
            message.role === 'user' 
              ? 'bg-gradient-to-r from-blue-500/90 to-violet-600/90 border-blue-300/30' 
              : 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 border-emerald-300/30'
          }`}>
            {message.role === 'user' ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            )}
          </div>
          
          {/* Message Content */}
          <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-2xl px-6 py-4 shadow-lg backdrop-blur-xl border ${
              message.role === 'user' 
                ? 'bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl' 
                : 'bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl'
            }`}>
              {message.role === 'assistant' ? (
                <div className="relative">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-white">
                    {displayedText}
                    {isTyping && (
                      <span className="inline-block w-2 h-5 bg-emerald-400 ml-1 animate-pulse"></span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-white">{message.content}</p>
                </div>
              )}
            </div>
          
            {/* Timestamp */}
            <span className="text-xs text-gray-300 mt-2 px-2">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {/* Action buttons for AI messages */}
            {message.role === 'assistant' && !isTyping && (
              <div className="flex items-center gap-2 mt-4 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                {/* Copy Button */}
                <button
                  onClick={onCopy}
                  className="p-2 text-white hover:text-emerald-400 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                  title="Copy message"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                  liked 
                    ? 'text-green-400 bg-green-500/20 scale-105' 
                    : 'text-white hover:text-green-400 hover:bg-white/20'
                }`}
                title="Like response"
              >
                <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              
              {/* Dislike Button */}
              <button
                onClick={handleDislike}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                  disliked 
                    ? 'text-red-400 bg-red-500/20 scale-105' 
                    : 'text-white hover:text-red-400 hover:bg-white/20'
                }`}
                title="Dislike response"
              >
                <svg className="w-4 h-4" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    )
}
