import React, { useState, useRef, useEffect } from 'react';

// Simplified emoji data
const emojis = {
    "smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚"],
    "people": ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳‍♂️", "🧕", "👮‍♀️", "👮‍♂️", "👷‍♀️", "👷‍♂️", "💂‍♀️", "💂‍♂️"],
    "animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🦍"],
    "food": ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬"],
    "activities": ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🥅", "🏒", "🏑", "🥍", "🏏", "⛳", "🏹", "🎣"],
    "travel": ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲", "🛵", "🏍", "🚨", "🚔", "🚍"],
    "objects": ["⌚", "📱", "📲", "💻", "⌨", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥"],
    "symbols": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️"]
};

const emojiCategories = [
    { name: "smileys", icon: "😀" },
    { name: "people", icon: "👨" },
    { name: "animals", icon: "🐶" },
    { name: "food", icon: "🍎" },
    { name: "activities", icon: "⚽" },
    { name: "travel", icon: "🚗" },
    { name: "objects", icon: "📱" },
    { name: "symbols", icon: "❤️" }
];

const EmojiPicker = ({ onEmojiSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("smileys");
    const [recentEmojis, setRecentEmojis] = useState([]);
    const pickerRef = useRef(null);
    
    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    // Load recent emojis from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('recentEmojis');
        if (stored) {
            try {
                setRecentEmojis(JSON.parse(stored).slice(0, 20));
            } catch (e) {
                console.error('Error parsing recent emojis', e);
            }
        }
    }, []);
    
    const handleEmojiClick = (emoji) => {
        onEmojiSelect(emoji);
        
        // Update recent emojis
        const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
        setRecentEmojis(updated);
        localStorage.setItem('recentEmojis', JSON.stringify(updated));
        
        setIsOpen(false);
    };
    
    return (
        <div className="emoji-picker-container relative" ref={pickerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-green-700 p-2 rounded-full transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50">
                    <div className="p-2 border-b border-gray-200">
                        <div className="flex space-x-1 overflow-x-auto pb-1">
                            {emojiCategories.map(category => (
                                <button
                                    key={category.name}
                                    onClick={() => setActiveCategory(category.name)}
                                    className={`p-2 rounded-md transition ${activeCategory === category.name ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                    aria-label={`${category.name} emojis`}
                                >
                                    {category.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {recentEmojis.length > 0 && (
                        <div className="p-2 border-b border-gray-200">
                            <h3 className="text-xs text-gray-500 mb-1">Recently used</h3>
                            <div className="grid grid-cols-8 gap-1">
                                {recentEmojis.map((emoji, index) => (
                                    <button
                                        key={`recent-${index}`}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="p-1 text-xl hover:bg-gray-100 rounded"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="p-2 h-48 overflow-y-auto">
                        <h3 className="text-xs text-gray-500 mb-1 capitalize">{activeCategory}</h3>
                        <div className="grid grid-cols-8 gap-1">
                            {emojis[activeCategory].map((emoji, index) => (
                                <button
                                    key={`${activeCategory}-${index}`}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="p-1 text-xl hover:bg-gray-100 rounded"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-2 border-t border-gray-200 text-xs text-center text-gray-500">
                        Click an emoji to select it
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiPicker;
