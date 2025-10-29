import RecordRTC, { RecordRTCPromisesHandler } from 'recordrtc';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { RecordingData } from '../types';

class RecordingService {
  private recorder: RecordRTCPromisesHandler | null = null;
  private stream: MediaStream | null = null;
  private currentMeetingId: string | null = null;

  async startRecording(meetingId: string, stream: MediaStream): Promise<void> {
    try {
      this.stream = stream;
      this.currentMeetingId = meetingId;

      this.recorder = new RecordRTCPromisesHandler(stream, {
        type: 'video',
        mimeType: 'video/webm;codecs=vp8,opus',
        bitsPerSecond: 128000,
      });

      await this.recorder.startRecording();

      // Update meeting status
      const meetingRef = doc(db, 'meetings', meetingId);
      await updateDoc(meetingRef, {
        isRecording: true,
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.recorder || !this.currentMeetingId) return null;

    try {
      await this.recorder.stopRecording();
      const blob = await this.recorder.getBlob();

      // Upload to Firebase Storage
      const storage = getStorage();
      const fileName = `recordings/${this.currentMeetingId}/${Date.now()}.webm`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      // Update meeting status
      const meetingRef = doc(db, 'meetings', this.currentMeetingId);
      await updateDoc(meetingRef, {
        isRecording: false,
        recordingUrl: url,
      });

      // Cleanup
      this.recorder = null;
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }
      this.stream = null;
      this.currentMeetingId = null;

      return url;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  isRecording(): boolean {
    return !!this.recorder;
  }
}

export default new RecordingService();