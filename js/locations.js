const supabaseUrl = "https://ngqsmsdxulgpiywlczcx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function formatPhoneNumber(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw; // fallback
}

async function loadStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("store_number,name,address,city,state,zip_code,phone_number")
    .order("store_number", { ascending: true });

  const container = document.getElementById("locations-list");

  if (error) {
    container.innerHTML = "<p>Error loading store locations.</p>";
    console.error("Supabase error:", error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No stores found.</p>";
    return;
  }

  container.innerHTML = `
    <table class="locations-table">
      <thead>
        <tr>
          <th>Store #</th>
          <th>Location</th>
          <th>Address</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map((store) => {
            const address = `${store.address}, ${store.city}, ${store.state} ${store.zip_code}`;
            const formattedPhone = formatPhoneNumber(store.phone_number);
            return `
              <tr>
                <td>${store.store_number}</td>
                <td>${store.name}</td>
                <td>${address}</td>
                <td><a href="tel:${store.phone_number}">${formattedPhone}</a></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

document.addEventListener("DOMContentLoaded", loadStores);
