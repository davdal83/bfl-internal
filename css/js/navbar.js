document.addEventListener("DOMContentLoaded", function () {
  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      const toggle = document.getElementById("mobile-menu");
      const navLinks = document.getElementById("nav-links");

      toggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");
      });
    });
});
