import React, { useState } from 'react';
import { MeetingHeaderProps } from '../../types';
import { Users, Clock, Copy, Check, Settings, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  title,
  participantCount,
  duration,
  meetingCode,
  isHost,
  onOpenSettings,
  onToggleWaitingRoom,
  isWaitingRoomEnabled,
  isReconnecting
}) => {
  const [copied, setCopied] = useState(false);

  const copyMeetingCode = async () => {
    await navigator.clipboard.writeText(meetingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-400 border-b border-dark-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <div className="flex items-center space-x-2 text-gray-400">
            <Users className="w-5 h-5" />
            <span>{participantCount}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-5 h-5" />
            <span>{duration}</span>
          </div>
          {isReconnecting && (
            <div className="text-yellow-400 text-sm">
              Reconnecting...
          </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="ghost"
              onClick={copyMeetingCode}
              className="text-gray-400 hover:text-white"
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono">{meetingCode}</span>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
            </Button>
          </div>

          {isHost && (
              <Button
              variant="ghost"
                onClick={onToggleWaitingRoom}
              className={`text-gray-400 hover:text-white ${
                isWaitingRoomEnabled ? 'text-primary-400' : ''
                }`}
              >
              <Shield className="w-5 h-5" />
              </Button>
          )}

              <Button
            variant="ghost"
                onClick={onOpenSettings}
            className="text-gray-400 hover:text-white"
              >
            <Settings className="w-5 h-5" />
              </Button>
        </div>
      </div>
    </div>
  );
};