import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationRequest {
  organizationName: string;
  organizationEmail: string;
  adminEmail: string;
  password: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationName, organizationEmail, adminEmail, password }: RegistrationRequest = await req.json();

    // Validate required fields
    if (!organizationName || !organizationEmail || !adminEmail || !password) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Create the organization
    const { data: organization, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: organizationName,
        domain: organizationEmail.split("@")[1],
        status: "active",
      })
      .select()
      .single();

    if (orgError) {
      console.error("Error creating organization:", orgError);
      return new Response(
        JSON.stringify({ error: "Failed to create organization: " + orgError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Create the admin user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      // Rollback: delete the organization
      await supabaseAdmin.from("organizations").delete().eq("id", organization.id);
      
      console.error("Error creating user:", authError);
      return new Response(
        JSON.stringify({ error: "Failed to create user: " + authError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Assign admin role to the user
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        organization_id: organization.id,
        role: "admin",
      });

    if (roleError) {
      // Rollback: delete user and organization
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from("organizations").delete().eq("id", organization.id);
      
      console.error("Error assigning role:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to assign role: " + roleError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create profile for the user
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: authData.user.id,
        organization_id: organization.id,
        email: adminEmail,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Non-critical, don't rollback
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        organizationId: organization.id,
        userId: authData.user.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
