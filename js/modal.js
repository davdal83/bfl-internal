document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open-request");
  const modal = document.getElementById("request-modal");
  const closeBtn = document.getElementById("close-request");

  if (openBtn && modal && closeBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.classList.add("hidden");
    });
  }
});
