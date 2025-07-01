async function loadUserProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error('Authentication error:', userError);
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('first_name, last_name, preferred_name, phone, store_number, profile_photo_url')
    .eq('user_id', userData.user.id)
    .single();

  if (profileError || !profile) {
    console.error('Profile fetch error:', profileError);
    return;
  }

  // Safely populate the DOM
  const imgEl = document.getElementById('profile-img');
  if (imgEl) {
    imgEl.src =
      profile.profile_photo_url ||
      'https://ngqsmsdxulgpiywlczcx.supabase.co/storage/v1/object/public/store-photos//profile_stock.png';
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '—';
  };

  setText('profile-first-view', profile.first_name);
  setText('profile-last-view', profile.last_name);
  setText('profile-preferred-view', profile.preferred_name || profile.first_name);
  setText('profile-phone-view', profile.phone);
  setText('profile-email', userData.user.email);
  setText('profile-store', profile.store_number);
}

window.loadUserProfile = loadUserProfile;

document.addEventListener('DOMContentLoaded', () => {
  const observer = new MutationObserver(() => {
    const section = document.getElementById('my-profile');
    if (section && section.style.display !== 'none') {
      loadUserProfile();
    }
  });

  observer.observe(document.body, { attributes: true, subtree: true });
});

function toggleProfileEditMode(editing) {
  const fields = ['first', 'last', 'preferred', 'phone'];

  fields.forEach((key) => {
    const input = document.getElementById(`profile-${key}-input`);
    const view = document.getElementById(`profile-${key}-view`);
    if (!input || !view) return;

    if (editing) {
      input.value = view.textContent.trim() === '—' ? '' : view.textContent.trim();
      input.style.display = 'block';
      view.style.display = 'none';
    } else {
      view.style.display = 'block';
      input.style.display = 'none';
    }
  });

  const btn = document.getElementById('edit-profile-btn');
  if (btn) btn.textContent = editing ? 'Save Changes' : 'Edit Profile';
}

let editing = false;

document.getElementById('edit-profile-btn')?.addEventListener('click', async () => {
  if (!editing) {
    toggleProfileEditMode(true);
    editing = true;
    return;
  }

  const updates = {
    first_name: document.getElementById('profile-first-input')?.value.trim(),
    last_name: document.getElementById('profile-last-input')?.value.trim(),
    preferred_name: document.getElementById('profile-preferred-input')?.value.trim(),
    phone: document.getElementById('profile-phone-input')?.value.trim(),
    updated_at: new Date().toISOString(),
  };

  const { data: userData } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userData.user.id);

  if (error) {
    alert('There was a problem saving your changes.');
    console.error(error);
    return;
  }

  await loadUserProfile();
  toggleProfileEditMode(false);
  editing = false;
});

document.getElementById('profile-img-input')?.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const { data: userData } = await supabase.auth.getUser();
  const fileExt = file.name.split('.').pop();
  const filePath = `avatars/${userData.user.id}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('store-photos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    alert(`Upload failed: ${uploadError.message}`);
    return;
  }

  const { data: publicURLData } = supabase
    .storage
    .from('store-photos')
    .getPublicUrl(filePath);

  const profilePhotoURL = publicURLData?.publicUrl;

  const { error: updateError } = await supabase
    .from('users')
    .update({ profile_photo_url: profilePhotoURL })
    .eq('user_id', userData.user.id);

  if (updateError) {
    alert('Failed to update profile photo.');
    console.error(updateError);
    return;
  }

  const imgEl = document.getElementById('profile-img');
  if (imgEl) imgEl.src = profilePhotoURL;
});

document.getElementById('change-password-btn')?.addEventListener('click', () => {
  window.location.href = '/bfl-internal/reset-password.html';
});

// Open modal
document.getElementById('change-password-btn')?.addEventListener('click', () => {
  document.getElementById('password-modal').style.display = 'flex';

  // Populate email for accessibility
  supabase.auth.getUser().then(({ data }) => {
    const emailInput = document.getElementById('inline-hidden-email');
    if (data?.user?.email && emailInput) {
      emailInput.value = data.user.email;
    }
  });
});

// Close modal
document.getElementById('close-password-modal')?.addEventListener('click', () => {
  document.getElementById('inline-reset-form').reset();
  document.getElementById('inline-status').textContent = '';
  document.getElementById('password-modal').style.display = 'none';
});

// Handle password update
document.getElementById('inline-reset-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('inline-new-password')?.value.trim();
  const status = document.getElementById('inline-status');

  if (!newPassword) {
    if (status) {
      status.textContent = 'Please enter a new password.';
      status.style.color = '#ce0e2d';
    }
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    status.textContent = 'Something went wrong. Please try again.';
    status.style.color = '#ce0e2d';
    console.error(error);
  } else {
    status.textContent = '✅ Password updated successfully.';
    status.style.color = '#205c30';

    setTimeout(() => {
      document.getElementById('inline-reset-form').reset();
      document.getElementById('password-modal').style.display = 'none';
    }, 1500);
  }
});

// 🔐 Handle logout when the sidebar button is clicked
document.getElementById('logout-button')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout failed:', error);
    alert('Something went wrong. Please try again.');
  } else {
    // ✅ Successfully logged out – redirect to login screen
    window.location.href = '/bfl-internal/login.html';
  }
});
