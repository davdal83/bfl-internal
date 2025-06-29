const supabaseUrl = "https://ngqsmsdxulgpiywlczcx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM";

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function loadStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("store_number,name,address,city,state,zip_code,phone_number,store_photo_url")
    .order("store_number", { ascending: true });

  const container = document.getElementById("locations-list");

  if (error) {
    container.innerHTML = "<p>Error loading store locations.</p>";
    console.error("Supabase error:", error);
    return;
  }

  if (data.length === 0) {
    container.innerHTML = "<p>No stores found.</p>";
    return;
  }

  container.innerHTML = data
    .map(store => {
      const address = `${store.address}, ${store.city}, ${store.state} ${store.zip_code}`;
      return `
        <div class="store-card">
          <div class="store-info">
            <h3>#${store.store_number} — ${store.name}</h3>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Phone:</strong> <a href="tel:${store.phone_number}">${store.phone_number}</a></p>
          </div>
        </div>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", loadStores);
