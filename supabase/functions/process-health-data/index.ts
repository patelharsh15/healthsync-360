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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Read file in chunks to reduce memory usage
    const text = await file.text()
    const chunkSize = 1000000 // Process 1MB at a time
    const chunks = []
    
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize))
    }

    // Process health metrics more efficiently
    const metrics = {
      steps: [] as number[],
      heartRate: [] as number[],
      activeEnergy: [] as number[]
    }

    // Process each chunk
    for (const chunk of chunks) {
      // Extract metrics using more efficient regex
      const processMetric = (type: string) => {
        const pattern = new RegExp(`<Record[^>]*type="${type}"[^>]*value="([\\d.]+)"`, 'g')
        let match
        const values: number[] = []
        
        while ((match = pattern.exec(chunk)) !== null) {
          const value = parseFloat(match[1])
          if (!isNaN(value)) {
            values.push(value)
          }
        }
        return values
      }

      metrics.steps.push(...processMetric('HKQuantityTypeIdentifierStepCount'))
      metrics.heartRate.push(...processMetric('HKQuantityTypeIdentifierHeartRate'))
      metrics.activeEnergy.push(...processMetric('HKQuantityTypeIdentifierActiveEnergyBurned'))
    }

    // Calculate daily averages more efficiently
    const calculateAverage = (values: number[]) => {
      if (values.length === 0) return null
      const sum = values.reduce((a, b) => a + b, 0)
      return Math.round(sum / values.length)
    }

    const processedData = {
      steps: calculateAverage(metrics.steps),
      heartRate: calculateAverage(metrics.heartRate),
      activeEnergy: calculateAverage(metrics.activeEnergy)
    }

    console.log('Processed health data:', processedData)

    // Get user ID from the authorization header
    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    if (userError) throw userError

    // Store the processed data
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