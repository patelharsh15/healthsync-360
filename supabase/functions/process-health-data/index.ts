import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process XML file and extract health data
    const text = await file.text()
    
    // Basic XML parsing (in a real app, use a proper XML parser)
    const healthData = {
      steps: text.match(/<Record type="HKQuantityTypeIdentifierStepCount".*?value="(\d+)".*?\/>/g),
      heartRate: text.match(/<Record type="HKQuantityTypeIdentifierHeartRate".*?value="(\d+)".*?\/>/g),
      activeEnergy: text.match(/<Record type="HKQuantityTypeIdentifierActiveEnergyBurned".*?value="(\d+)".*?\/>/g),
    }

    // Insert processed data into the health_data table
    const { error: insertError } = await supabase
      .from('health_data')
      .insert({
        platform: 'apple_health',
        data_type: 'import',
        value: healthData,
        timestamp: new Date().toISOString(),
      })

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ message: 'Health data processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process health data', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})