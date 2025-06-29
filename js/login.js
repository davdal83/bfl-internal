document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Add redirect logic based on role, etc.
      message.textContent = "✅ Login successful!";
      message.style.color = "#2D5C2A";

    } catch (err) {
      console.error("Login Error:", err.message || err);
      message.textContent = "❌ Login failed. Check your credentials.";
      message.style.color = "#c0392b";
    }
  });
});
