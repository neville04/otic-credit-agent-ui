import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Azure credentials from environment
    const AZURE_TENANT_ID = Deno.env.get('AZURE_TENANT_ID');
    const AZURE_CLIENT_ID = Deno.env.get('AZURE_CLIENT_ID');
    const AZURE_CLIENT_SECRET = Deno.env.get('AZURE_CLIENT_SECRET');
    const AZURE_AGENT_ENDPOINT = Deno.env.get('AZURE_AGENT_ENDPOINT');

    if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_AGENT_ENDPOINT) {
      throw new Error('Azure credentials not configured');
    }

    // Get request body
    const { reportId, template, customPrompt, knowledgeBases } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's organization
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userRole) {
      throw new Error('User not assigned to an organization');
    }

    // Get organization's Azure connection config
    const { data: org } = await supabase
      .from('organizations')
      .select('azure_connection_config')
      .eq('id', userRole.organization_id)
      .single();

    console.log('Organization config:', org);

    // Step 1: Get Azure AD access token
    const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: AZURE_CLIENT_ID,
      client_secret: AZURE_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Azure AD token error:', errorText);
      throw new Error('Failed to get Azure AD token');
    }

    const { access_token } = await tokenResponse.json();
    console.log('Successfully obtained Azure AD token');

    // Step 2: Update report status to processing
    await supabase
      .from('reports')
      .update({ status: 'processing' })
      .eq('id', reportId);

    // Step 3: Trigger Azure agent
    const agentPayload = {
      reportId,
      template,
      customPrompt,
      knowledgeBases,
      organizationConfig: org?.azure_connection_config || {},
      timestamp: new Date().toISOString()
    };

    console.log('Triggering Azure agent with payload:', agentPayload);

    const agentResponse = await fetch(AZURE_AGENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentPayload)
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Azure agent error:', errorText);
      
      // Update report with error
      await supabase
        .from('reports')
        .update({ 
          status: 'failed',
          error_message: `Agent returned ${agentResponse.status}: ${errorText}`
        })
        .eq('id', reportId);

      throw new Error('Failed to trigger Azure agent');
    }

    const agentResult = await agentResponse.json();
    console.log('Azure agent response:', agentResult);

    // Step 4: Update report with result
    await supabase
      .from('reports')
      .update({ 
        status: 'completed',
        result: agentResult,
        completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    // Log audit trail
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: userRole.organization_id,
        user_id: user.id,
        action: 'trigger_analysis',
        resource_type: 'report',
        resource_id: reportId,
        details: { template, customPrompt }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        reportId,
        result: agentResult 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in trigger-azure-agent:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
