import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, image, audio } = await req.json()
    console.log('Received request:', { hasImage: !!image, hasAudio: !!audio })

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured')
    }

    // If there's an image or audio, add it to the user's message content
    if (image || audio) {
      const lastUserMessage = messages.find((m: any) => m.role === 'user')
      if (lastUserMessage) {
        lastUserMessage.content = [
          { type: 'text', text: lastUserMessage.content },
          image ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } } :
          audio ? { type: 'audio', audio_url: { url: `data:audio/webm;base64,${audio}` } } : null
        ].filter(Boolean)
      }
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', error)
      throw new Error(`Groq API error: ${error}`)
    }

    const data = await response.json()
    console.log('Groq API response:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in groq-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})