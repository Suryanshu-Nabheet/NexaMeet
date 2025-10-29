import OpenAI from 'openai';

// Initialize the OpenAI client
export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only use this in development
});

// Helper function to check if the API key is configured
export const isAIConfigured = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};

// Example function to generate AI response
export const generateAIResponse = async (prompt: string) => {
  if (!isAIConfigured()) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}; 