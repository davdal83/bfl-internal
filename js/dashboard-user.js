document.addEventListener("DOMContentLoaded", async () => {
  // --- SESSION CHECK ---
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { user } = session;

  // --- FETCH FIRST NAME FOR GREETING ---
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

  // --- LOGOUT FUNCTIONALITY ---
  const logout = document.getElementById("logout-button");
  logout.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });

  // --- RESPONSIVE SIDEBAR TOGGLE ---
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("menu-toggle");
  const closeBtn = document.getElementById("close-sidebar");
  const navLinks = document.querySelectorAll(".sidebar-nav a");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.add("show");
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("show");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("show");
    });
  });
});
