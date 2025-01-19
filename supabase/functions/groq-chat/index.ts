import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, image, audio } = await req.json();
    console.log('Received request:', { hasImage: !!image, hasAudio: !!audio, messageCount: messages.length });

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    let formattedMessages;
    
    if (image) {
      formattedMessages = [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this meal image and provide detailed nutritional insights." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
              },
            },
          ],
        },
      ];
    } else if (audio) {
      // For audio analysis, we'll truncate the transcript to stay within limits
      const maxLength = 15000; // Adjust this value based on testing
      const truncatedAudio = audio.length > maxLength ? audio.substring(0, maxLength) + "..." : audio;
      
      formattedMessages = [
        {
          role: "system",
          content: "You are a health journal AI assistant. Analyze the voice journal entry and provide supportive feedback, identify patterns, and offer personalized health insights. Keep your response concise and focused on the most important points."
        },
        {
          role: "user",
          content: `Analyze this voice journal entry and provide brief, focused health insights and recommendations. The user said: ${truncatedAudio}`
        }
      ];
    } else {
      formattedMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));
    }

    console.log('Sending formatted messages to Groq:', JSON.stringify(formattedMessages, null, 2));

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: image ? "llama-3.2-11b-vision-preview" : "mixtral-8x7b-32768",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    console.log('Groq API response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});