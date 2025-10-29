import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface ScreenShareProps {
  onStartSharing: (stream: MediaStream) => void;
  onStopSharing: () => void;
  isSharing: boolean;
}

export const ScreenShare: React.FC<ScreenShareProps> = ({
  onStartSharing,
  onStopSharing,
  isSharing,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const startScreenShare = useCallback(async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      });

      stream.getVideoTracks()[0].addEventListener('ended', () => {
        onStopSharing();
        toast.success('Screen sharing stopped');
      });

      onStartSharing(stream);
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    } finally {
      setIsLoading(false);
    }
  }, [onStartSharing, onStopSharing]);

  const stopScreenShare = useCallback(() => {
    onStopSharing();
    toast.success('Screen sharing stopped');
  }, [onStopSharing]);

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={isSharing ? stopScreenShare : startScreenShare}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isSharing
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Starting...
          </span>
        ) : isSharing ? (
          'Stop Sharing'
        ) : (
          'Share Screen'
        )}
      </button>
    </div>
  );
}; 