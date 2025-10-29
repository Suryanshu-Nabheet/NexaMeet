import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const emojis = ['👍', '👏', '❤️', '🎉', '👋', '🤔', '😊', '🙌'];

  return (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-dark-300 rounded-lg shadow-lg p-2 z-50">
      <div className="grid grid-cols-4 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            className="w-8 h-8 text-xl hover:bg-dark-200 rounded-lg transition-colors"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};