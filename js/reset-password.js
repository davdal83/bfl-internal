// Supabase setup
const supabase = window.supabase.createClient(
  "https://ngqsmsdxulgpiywlczcx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM"
);

document.addEventListener("DOMContentLoaded", () => {
  const forgotForm = document.getElementById("forgot-form");
  const forgotMessage = document.getElementById("forgot-message");

  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("forgot-email").value.trim();

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://davdal83.github.io/bfl-internal/update-password.html" // ← Update this to match your actual reset page
        });

        if (error) throw error;

        forgotMessage.textContent = "✅ Password reset link sent! Check your inbox.";
        forgotMessage.style.color = "#2D5C2A";
        forgotForm.reset();
      } catch (err) {
        console.error("Password Reset Error:", err.message || err);
        forgotMessage.textContent = "❌ Something went wrong. Please try again.";
        forgotMessage.style.color = "#c0392b";
      }
    });
  }
});
