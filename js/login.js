// login.js

// Initialize Supabase client
const supabase = window.supabaseClient;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      // Sign in using email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      message.textContent = "Login successful. Redirecting...";
      message.style.color = "#2D5C2A";

      // Fetch user role from the users table
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      const role = userProfile.role;

      // Redirect based on role
      if (role === "admin") {
        setTimeout(() => {
          window.location.href = "dashboard-admin.html";
        }, 1500);
      } else if (role === "user") {
        setTimeout(() => {
          window.location.href = "dashboard-user.html";
        }, 1500);
      } else {
        message.textContent = "Access denied. Your account is pending approval or has no role assigned.";
        message.style.color = "#c0392b";
      }

    } catch (err) {
      console.error("Login Error:", err.message || err);
      message.innerHTML = `
        Access denied. Please check your credentials or 
        <a href="index.html" style="color: #2D5C2A; text-decoration: underline;">return to home</a>.
      `;
      message.style.color = "#c0392b";
    }
  });
});
