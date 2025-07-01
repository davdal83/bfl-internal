fetch("head.html")
  .then((res) => res.text())
  .then((html) => {
    const head = document.querySelector("head");
    head.insertAdjacentHTML("beforeend", html);
  })
  .catch((err) => {
    console.error("Failed to load shared head:", err);
  });
