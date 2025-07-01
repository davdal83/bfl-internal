const supabaseUrl = "https://ngqsmsdxulgpiywlczcx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function formatGroup(title, members) {
  if (members.length === 0) return "";
  return `
    <div>
      <h2>${title}</h2>
      <div class="team-group">
        ${members
          .map(
            (member) => `
          <div class="team-card">
            <img src="${member.photo_url || 'img/default.png'}" alt="${member.name}" />
            <h3>${member.name}</h3>
            <p>${member.title}</p>
            <a href="mailto:${member.email}">${member.email}</a>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

async function loadPeople() {
  const container = document.getElementById("team-cards");

  const { data, error } = await supabase
    .from("leadership_team")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error loading team:", error);
    container.innerHTML = "<p>Error loading team members.</p>";
    return;
  }

  const directorOps = data.filter(
    (p) => p.title.trim() === "Director of Operations"
  );
  const supervisors = data.filter(
    (p) => p.title.trim() === "Area Supervisor"
  );
  const marketing = data.filter(
    (p) => p.title.trim() === "Marketing Director"
  );

  container.innerHTML =
    formatGroup("Director of Operations", directorOps) +
    formatGroup("Area Supervisors", supervisors) +
    formatGroup("Marketing Director", marketing);
}

document.addEventListener("DOMContentLoaded", loadPeople);
