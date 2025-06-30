const { createClient } = supabase;

const supabaseClient = createClient(
  'https://ngqsmsdxulgpiywlczcx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM'
);

// 🚩 Always show the form during dev:
const form = document.getElementById('reset-form');
if (form) form.style.display = 'block';

// Listen for password recovery session from Supabase
supabaseClient.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth event:', event);
  if (event === 'PASSWORD_RECOVERY') {
    if (form) form.style.display = 'block';

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (user) {
      const hiddenEmail = document.getElementById('hidden-email');
      if (hiddenEmail) hiddenEmail.value = user.email;
    } else {
      console.warn('Could not fetch user for hidden email field', error);
    }
  }
});

// Handle form submission to update password
document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('new-password')?.value.trim();
  const status = document.getElementById('status');

  if (!password) {
    if (status) {
      status.textContent = 'Please enter a new password.';
      status.style.color = '#ce0e2d';
    }
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({ password });

  if (error) {
    console.error('Password update error:', error);
    if (status) {
      status.textContent = 'Something went wrong. Please try again.';
      status.style.color = '#ce0e2d';
    }
  } else {
      if (status) {
        status.textContent = '✅ Password updated! Redirecting you back to the dashboard...';
        status.style.color = '#205c30';
      }

      setTimeout(() => {
        window.location.href = '/bfl-internal/dashboard-user.html';
      }, 2500);

  }
});
