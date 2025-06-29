const supabaseUrl = "https://ngqsmsdxulgpiywlczcx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      alert("Login failed. Check your email and password.");
      console.error("Auth Error:", authError.message);
      return;
    }

    const userEmail = authData.user.email;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", userEmail)
      .single();

    if (userError || !userData) {
      alert("Account not found in user directory.");
      console.error("User lookup error:", userError);
      return;
    }

    const role = userData.role;

    if (role === "admin") {
      window.location.href = "dashboard-admin.html";
    } else if (role === "user") {
      window.location.href = "dashboard-user.html";
    } else {
      alert("Unauthorized: Role not recognized.");
    }
  });
});
