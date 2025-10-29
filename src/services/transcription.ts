import { openai } from './ai';

/**
 * Transcribes audio using OpenAI's Whisper API
 * @param audioBlob The audio blob to transcribe
 * @returns Promise<string> The transcribed text
 */
export const transcribe = async (audioBlob: Blob): Promise<string> => {
  try {
    // Create a File object from the Blob
    const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type });

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

/**
 * Converts a Blob to base64 string
 * @param blob The blob to convert
 * @returns Promise<string> The base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}; 