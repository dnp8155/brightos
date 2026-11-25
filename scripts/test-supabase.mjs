import { createClient } from "@supabase/supabase-js";

async function testConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qubusinubndlwrqbtynf.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  console.log("Testing connection to Supabase project:", url);

  const supabase = createClient(url, serviceKey);

  // Check auth health
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error("Auth Admin API returned error:", error.message);
    } else {
      console.log("✓ Supabase Auth API successfully reached. Users count:", data.users?.length ?? 0);
    }
  } catch (err) {
    console.error("Auth test exception:", err.message);
  }

  // Check database table list
  try {
    const { data, error } = await supabase.from("businesses").select("*").limit(1);
    if (error) {
      console.log("Database table probe notice:", error.message);
      console.log("(Migration 20261125000001_phase2_schema_and_rls.sql is ready to be executed on the Supabase SQL editor.)");
    } else {
      console.log("✓ 'businesses' table exists and query succeeded!");
    }
  } catch (err) {
    console.error("Database query exception:", err.message);
  }
}

testConnection();
