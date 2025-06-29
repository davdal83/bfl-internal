const supabaseUrl = "https://ngqsmsdxulgpiywlczcx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

function formatGroup(title, members) {
  if (members.length === 0) return '';
  return `
    <div>
      <h2 style="text-align:center; color:#2D5C2A;">${title}</h2>
      <div class="team-group">
        ${members.map(member => `
          <div class="team-card">
            <img src="${member.photo_url || 'img/default.png'}" alt="${member.name}" />
            <h3>${member.name}</h3>
            <p>${member.title}</p>
            <a href="mailto:${member.email}">${member.email}</a>
          </div>
        `).join('')}
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

  const director = data.filter(p => p.title.toLowerCase().includes("director of operations"));
  const supervisors = data.filter(p => p.title.toLowerCase().includes("supervisor"));
  const marketing = data.filter(p => p.title.toLowerCase().includes("marketing"));

  container.innerHTML =
    formatGroup("Director of Operations", director) +
    formatGroup("Supervisors", supervisors) +
    formatGroup("Marketing", marketing);
}

document.addEventListener("DOMContentLoaded", loadPeople);
