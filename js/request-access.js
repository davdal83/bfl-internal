// js/request-access.js

document.addEventListener("DOMContentLoaded", () => {
  const requestForm = document.getElementById("request-form");
  const messageBox = document.getElementById("request-message");

  if (requestForm) {
    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const first_name = document.getElementById("first_name").value.trim();
      const last_name = document.getElementById("last_name").value.trim();
      const email = document.getElementById("email-request").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const store_number = document.getElementById("store_number").value.trim();
      const password = document.getElementById("password-request").value;

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          first_name,
          last_name,
          phone,
          store_number,
          role: null,
          status: "pending",
        });
        if (insertError) throw insertError;

        messageBox.textContent = "✅ Request submitted! We'll notify you once approved.";
        messageBox.style.color = "#2D5C2A";
        requestForm.reset();
      } catch (err) {
        console.error("Access Request Error:", err);
        messageBox.textContent = "❌ Something went wrong. Please try again or contact support.";
        messageBox.style.color = "#c0392b";
      }
    });
  }
});
