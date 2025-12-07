import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  organizationId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

// Helper to wait for run completion
async function waitForRunCompletion(
  endpoint: string, 
  threadId: string, 
  runId: string, 
  accessToken: string,
  apiVersion: string
): Promise<any> {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = await fetch(
      `${endpoint}/threads/${threadId}/runs/${runId}?api-version=${apiVersion}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get run status: ${errorText}`);
    }
    
    const run = await response.json();
    console.log(`Run status: ${run.status}`);
    
    if (run.status === 'completed') {
      return run;
    } else if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
      throw new Error(`Run ${run.status}: ${run.last_error?.message || 'Unknown error'}`);
    }
    
    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('Run timed out');
}

// Get messages from a thread
async function getThreadMessages(
  endpoint: string,
  threadId: string,
  accessToken: string,
  apiVersion: string
): Promise<any[]> {
  const response = await fetch(
    `${endpoint}/threads/${threadId}/messages?api-version=${apiVersion}&order=desc&limit=1`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get messages: ${errorText}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, organizationId, conversationHistory }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Azure credentials from environment
    const AZURE_TENANT_ID = Deno.env.get('AZURE_TENANT_ID');
    const AZURE_CLIENT_ID = Deno.env.get('AZURE_CLIENT_ID');
    const AZURE_CLIENT_SECRET = Deno.env.get('AZURE_CLIENT_SECRET');
    const AZURE_AGENT_ENDPOINT = Deno.env.get('AZURE_AGENT_ENDPOINT'); // e.g., https://xxx.services.ai.azure.com/api/projects/xxx
    const AZURE_AGENT_ID = Deno.env.get('AZURE_AGENT_ID'); // e.g., asst_xxx
    const AZURE_AI_API_VERSION = Deno.env.get('AZURE_AI_API_VERSION') || 'v1';

    if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_AGENT_ENDPOINT) {
      console.error('Missing Azure credentials');
      return new Response(
        JSON.stringify({ error: "Azure agent not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Getting Azure AD token...');

    // Step 1: Get Azure AD access token
    const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`;
    const tokenParams = new URLSearchParams({
      client_id: AZURE_CLIENT_ID,
      client_secret: AZURE_CLIENT_SECRET,
      scope: 'https://cognitiveservices.azure.com/.default',
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
      return new Response(
        JSON.stringify({ 
          response: "Unable to authenticate with Azure. Please check credentials.",
          error: "Azure AD authentication failed"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { access_token } = await tokenResponse.json();
    console.log('Successfully obtained Azure AD token');

    // If we have an agent ID, use the Threads/Runs API
    if (AZURE_AGENT_ID) {
      console.log('Using Azure AI Foundry Agent API with agent:', AZURE_AGENT_ID);
      
      // Create thread and run in one call
      const createRunResponse = await fetch(
        `${AZURE_AGENT_ENDPOINT}/threads/runs?api-version=${AZURE_AI_API_VERSION}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistant_id: AZURE_AGENT_ID,
            thread: {
              messages: [
                { role: 'user', content: message }
              ]
            }
          })
        }
      );

      if (!createRunResponse.ok) {
        const errorText = await createRunResponse.text();
        console.error('Azure create run error:', createRunResponse.status, errorText);
        return new Response(
          JSON.stringify({ 
            response: `Azure agent error: ${errorText}`,
            error: "Azure agent request failed"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const runData = await createRunResponse.json();
      console.log('Created thread and run:', runData.id, 'thread:', runData.thread_id);

      // Wait for run to complete
      await waitForRunCompletion(
        AZURE_AGENT_ENDPOINT,
        runData.thread_id,
        runData.id,
        access_token,
        AZURE_AI_API_VERSION
      );

      // Get the assistant's response
      const messages = await getThreadMessages(
        AZURE_AGENT_ENDPOINT,
        runData.thread_id,
        access_token,
        AZURE_AI_API_VERSION
      );

      const assistantMessage = messages.find(m => m.role === 'assistant');
      const responseContent = assistantMessage?.content?.[0]?.text?.value || 
                              assistantMessage?.content?.[0]?.value ||
                              'No response received from agent';

      console.log('Azure agent response received');

      return new Response(
        JSON.stringify({ response: responseContent }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    
    // Fallback: Try chat completions endpoint for Azure OpenAI
    console.log('Using Azure OpenAI chat completions API');
    
    const agentResponse = await fetch(
      `${AZURE_AGENT_ENDPOINT}?api-version=${AZURE_AI_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...(conversationHistory || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
          ],
          max_tokens: 2000
        })
      }
    );

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Azure agent error:', agentResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          response: `Azure agent error: ${errorText}`,
          error: "Azure agent request failed"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentResult = await agentResponse.json();
    const aiResponse = agentResult.choices?.[0]?.message?.content || 
                       agentResult.output || 
                       agentResult.response ||
                       JSON.stringify(agentResult);

    console.log('Azure agent response received');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I encountered an error processing your request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
