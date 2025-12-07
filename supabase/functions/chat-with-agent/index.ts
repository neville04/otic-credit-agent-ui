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
    const AZURE_AGENT_ENDPOINT = Deno.env.get('AZURE_AGENT_ENDPOINT');
    const AZURE_AI_PROJECT_API_KEY = Deno.env.get('AZURE_AI_PROJECT_API_KEY');
    const AZURE_AI_API_VERSION = Deno.env.get('AZURE_AI_API_VERSION') || '2025-11-15-preview';

    console.log('Azure config check:', { 
      hasEndpoint: !!AZURE_AGENT_ENDPOINT, 
      hasApiKey: !!AZURE_AI_PROJECT_API_KEY,
      apiVersion: AZURE_AI_API_VERSION
    });

    if (!AZURE_AGENT_ENDPOINT || !AZURE_AI_PROJECT_API_KEY) {
      console.error('Missing Azure credentials');
      return new Response(
        JSON.stringify({ error: "Azure agent not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the chat completions URL - endpoint already includes the OpenAI protocol path
    const chatUrl = `${AZURE_AGENT_ENDPOINT}/chat/completions?api-version=${AZURE_AI_API_VERSION}`;
    
    console.log('Calling Azure agent at:', chatUrl);

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: 'You are the Otic Credit Agent, an enterprise AI assistant specialized in credit analysis, risk assessment, and financial intelligence. Help users with credit-related queries, report generation, and financial analysis. Be professional, accurate, and helpful.'
      },
      ...(conversationHistory || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    // Call the Azure agent using OpenAI-compatible format with api-key header
    const agentResponse = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_AI_PROJECT_API_KEY,
      },
      body: JSON.stringify({
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log('Azure agent response status:', agentResponse.status);

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('Azure agent error:', agentResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          response: `I apologize, but I encountered an error connecting to the Azure agent. Error: ${errorText}`,
          error: "Azure agent request failed"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentResult = await agentResponse.json();
    console.log('Azure agent result keys:', Object.keys(agentResult));
    
    const aiResponse = agentResult.choices?.[0]?.message?.content || 
                       agentResult.output || 
                       agentResult.response ||
                       'I apologize, but I could not process your request at this time.';

    console.log('Azure agent response received successfully');

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
