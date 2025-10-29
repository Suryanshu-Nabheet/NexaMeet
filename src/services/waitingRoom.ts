import { db } from './firebase';
import { collection, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

export interface WaitingParticipant {
  id: string;
  name: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const waitingRoomService = {
  async addToWaitingRoom(meetingId: string, participant: Omit<WaitingParticipant, 'status'>) {
    const waitingRef = doc(db, 'meetings', meetingId, 'waitingRoom', participant.id);
    await setDoc(waitingRef, {
      ...participant,
      status: 'pending',
      timestamp: Date.now()
    });
  },

  async approveParticipant(meetingId: string, participantId: string) {
    const waitingRef = doc(db, 'meetings', meetingId, 'waitingRoom', participantId);
    await updateDoc(waitingRef, { status: 'approved' });
  },

  async rejectParticipant(meetingId: string, participantId: string) {
    const waitingRef = doc(db, 'meetings', meetingId, 'waitingRoom', participantId);
    await updateDoc(waitingRef, { status: 'rejected' });
  },

  subscribeToWaitingRoom(meetingId: string, callback: (participants: WaitingParticipant[]) => void) {
    const waitingRef = collection(db, 'meetings', meetingId, 'waitingRoom');
    return onSnapshot(waitingRef, (snapshot) => {
      const participants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WaitingParticipant[];
      callback(participants);
    });
  }
}; 