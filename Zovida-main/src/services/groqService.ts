import Groq from "groq-sdk";

let groq: Groq | null = null;

export const initializeGroq = (apiKey: string) => {
  groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

export const chatWithGroq = async (message: string, history: { role: "user" | "assistant" | "system"; content: string }[] = []) => {
  if (!groq) {
    throw new Error("Groq API key not set. Please provide a key.");
  }

  try {
    const systemPrompt = `You are Zovida, a medical AI assistant for an Imagine Cup project.
  Your goal is to help users understand medication safety, interactions, and side effects.
  
  CRITICAL INSTRUCTIONS:
  1. If a user asks to consult a doctor, talk to a professional, or shows symptoms that require medical attention, you MUST include the tag "[navigate:doctors]" at the end of your response to help them redirect.
  2. Keep responses concise, professional, and empathetic.
  3. Always advise users to consult with a real healthcare provider for final medical decisions.
  4. You can provide information about common drug-drug interactions if asked.
  5. The current application has pages: Home (/), Scan (/scan), Results (/results), Doctors (/doctors), Auth (/auth), and SOS (/sos).
  6. If a user is in a medical emergency, feels severe pain, or needs immediate help, you MUST include the tag "[navigate:sos]" at the end of your response to trigger the emergency SOS mode.
  7. If they want to scan a prescription, tell them to click the "Scan Prescription" button on the home page.`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...history,
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages as any[],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "I couldn't generate a response.";
  } catch (error) {
    console.error("Error chatting with Groq:", error);
    throw error;
  }
};
