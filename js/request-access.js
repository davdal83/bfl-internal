const supabaseUrlRA = "https://ngqsmsdxulgpiywlczcx.supabase.co";
const supabaseKeyRA =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM";

const supabaseRA = window.supabase.createClient(supabaseUrlRA, supabaseKeyRA);

document.addEventListener("DOMContentLoaded", () => {
  const requestForm = document.getElementById("request-form");
  const messageBox = document.getElementById("request-message");

  if (requestForm) {
    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const first_name = document.getElementById("first_name").value.trim();
      const last_name = document.getElementById("last_name").value.trim();
      const email = document.getElementById("email-request").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const store_number = document.getElementById("store_number").value.trim();
      const password = document.getElementById("password-request").value;

      try {
        // Create new Auth user
        const { data: authData, error: authError } = await supabaseRA.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // Insert user details into users table
        const { error: insertError } = await supabaseRA.from("users").insert({
          email,
          first_name,
          last_name,
          phone,
          store_number,
          role: null,
          status: "pending",
        });

        if (insertError) throw insertError;

        // Show confirmation
        messageBox.textContent = "✅ Request submitted! We'll notify you once approved.";
        messageBox.style.color = "#2D5C2A";
        requestForm.reset();
      } catch (err) {
        console.error("Access Request Error:", err);
        messageBox.textContent = "❌ Something went wrong. Please try again or contact support.";
        messageBox.style.color = "#c0392b";
      }
    });
  }
});
