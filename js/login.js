document.addEventListener("DOMContentLoaded", () => {
  // Get references to the login form and message area
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  // Handle login form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Get user input
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      // Authenticate user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Show success message before role check
      message.textContent = "Login successful. Redirecting...";
      message.style.color = "#2D5C2A";

      // Query 'users' table to get the logged-in user's role
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      const role = userProfile.role;

      // Redirect based on user role
      if (role === "admin") {
        setTimeout(() => {
          window.location.href = "dashboard-admin.html";
        }, 1500);
      } else if (role === "user") {
        setTimeout(() => {
          window.location.href = "dashboard-user.html";
        }, 1500);
      } else {
        // Handle case where role is missing or unapproved
        message.textContent = "Access denied. Your account is pending approval or has no role assigned.";
        message.style.color = "#c0392b";
      }

    } catch (err) {
      // Display a clear and helpful error message on login failure
      console.error("Login Error:", err.message || err);
      message.innerHTML = `
        Access denied. Please check your credentials or 
        <a href="index.html" style="color: #2D5C2A; text-decoration: underline;">return to home</a>.
      `;
      message.style.color = "#c0392b";
    }
  });
});
