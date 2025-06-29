document.addEventListener("DOMContentLoaded", function () {
  fetch("/bfl-internal/navbar.html")
    .then(response => {
      if (!response.ok) throw new Error("Navbar fetch failed");
      return response.text();
    })
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      const toggle = document.getElementById("mobile-menu");
      const navLinks = document.getElementById("nav-links");

      if (toggle && navLinks) {
        toggle.addEventListener("click", () => {
          navLinks.classList.toggle("show");
        });
      }
    })
    .catch(error => {
      console.error("Navbar failed to load:", error);
    });
});
