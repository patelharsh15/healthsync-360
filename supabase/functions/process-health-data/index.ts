import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Process XML file in chunks to avoid memory issues
    const text = await file.text()
    console.log('Processing health data file...')
    
    // Extract health metrics using regex with boundaries for better performance
    const extractMetric = (text: string, type: string) => {
      const regex = new RegExp(`<Record type="${type}"[^>]*value="([^"]*)"`, 'g')
      const matches = text.match(regex)
      if (!matches) return []
      return matches.map(match => {
        const value = match.match(/value="([^"]*)"/)
        return value ? parseFloat(value[1]) : null
      }).filter(v => v !== null)
    }

    // Process metrics in smaller chunks
    const healthData = {
      steps: extractMetric(text, 'HKQuantityTypeIdentifierStepCount'),
      heartRate: extractMetric(text, 'HKQuantityTypeIdentifierHeartRate'),
      activeEnergy: extractMetric(text, 'HKQuantityTypeIdentifierActiveEnergyBurned'),
    }

    // Calculate daily averages
    const calculateAverage = (values: number[]) => {
      return values.length > 0 ? Math.round(values.reduce((a, b) => a + b) / values.length) : null
    }

    const processedData = {
      steps: calculateAverage(healthData.steps),
      heartRate: calculateAverage(healthData.heartRate),
      activeEnergy: calculateAverage(healthData.activeEnergy),
    }

    console.log('Extracted health data:', processedData)

    // Get user ID from the authorization header
    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user ID from the JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError) throw userError

    // Insert processed data into the health_data table
    const { error: insertError } = await supabase
      .from('health_data')
      .insert({
        user_id: user?.id,
        platform: 'apple_health',
        data_type: 'import',
        value: processedData,
      })

    if (insertError) {
      console.error('Error inserting health data:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ message: 'Health data processed successfully', data: processedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error processing health data:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process health data', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})