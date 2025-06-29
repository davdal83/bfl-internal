document.addEventListener("DOMContentLoaded", async () => {
  // Check for session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Fetch first name
  const { user } = session;
  const { data: profile, error } = await supabase
    .from("users")
    .select("first_name")
    .eq("user_id", user.id)
    .single();

  const welcome = document.getElementById("welcome-message");

  if (error || !profile?.first_name) {
    welcome.textContent = "Welcome back. Let’s get to work.";
  } else {
    welcome.textContent = `Welcome back, ${profile.first_name}. Let’s get to work.`;
  }

  // Logout
  const logout = document.getElementById("logout-button");
  logout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
});
