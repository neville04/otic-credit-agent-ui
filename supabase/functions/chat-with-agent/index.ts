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

async function getAzureAccessToken(): Promise<string> {
  const tenantId = Deno.env.get("AZURE_TENANT_ID");
  const clientId = Deno.env.get("AZURE_CLIENT_ID");
  const clientSecret = Deno.env.get("AZURE_CLIENT_SECRET");

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure credentials not configured");
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://cognitiveservices.azure.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token error:", errorText);
    throw new Error("Failed to get Azure access token");
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req: Request) => {
  // Handle CORS preflight
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

    // Get Azure access token
    const accessToken = await getAzureAccessToken();
    const agentEndpoint = Deno.env.get("AZURE_AGENT_ENDPOINT");

    if (!agentEndpoint) {
      return new Response(
        JSON.stringify({ error: "Azure agent endpoint not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Azure agent
    const agentResponse = await fetch(agentEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        organizationId,
        userId: user.id,
        conversationHistory: conversationHistory || [],
      }),
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error("Agent error:", errorText);
      
      // Return a helpful error message but still valid response
      return new Response(
        JSON.stringify({ 
          response: "I'm having trouble connecting to the credit analysis system right now. Please try again in a moment, or check that your Azure agent is properly configured.",
          error: "Agent unavailable"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const agentData = await agentResponse.json();

    return new Response(
      JSON.stringify({ 
        response: agentData.response || agentData.message || "Analysis complete.",
        data: agentData
      }),
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
