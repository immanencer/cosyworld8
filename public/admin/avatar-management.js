document.addEventListener("DOMContentLoaded", () => {
  // State Management
  const state = {
    currentPage: 1,
    pageSize: 20,
    totalAvatars: 0,
    currentStatusFilter: "all",
    currentModelFilter: "all", 
    currentSearch: "",
  };

  // Load available models
  async function loadModels() {
    try {
      const response = await fetch('/api/models/config');
      const data = await response.json();
      const modelSelect = document.getElementById('model-filter');
      const avatarModelSelect = document.getElementById('avatar-model');
      
      // Add models to filter select
      Object.keys(data).forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });

      // Add models to avatar form select
      Object.keys(data).forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        avatarModelSelect.appendChild(option);
      });

      // Add filter listeners
      modelSelect.addEventListener('change', () => {
        state.currentModelFilter = modelSelect.value;
        state.currentPage = 1;
        loadAvatars();
      });
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  loadModels();

  // DOM Elements 
  const elements = {
    statusFilter: document.getElementById('status-filter'),
    modelFilter: document.getElementById('model-filter'),
    avatarsBody: document.getElementById("avatars-body"),
    paginationInfo: document.getElementById("pagination-info"),
    prevPageBtn: document.getElementById("prev-page"),
    nextPageBtn: document.getElementById("next-page"),
    avatarFilter: document.getElementById("avatar-filter"),
    avatarSearch: document.getElementById("avatar-search"),
    newAvatarBtn: document.getElementById("new-avatar"),
    avatarModal: document.getElementById("avatar-modal"),
    closeModal: document.getElementById("close-modal"),
    cancelEdit: document.getElementById("cancel-edit"),
    deleteAvatarBtn: document.getElementById("delete-avatar"),
    avatarForm: document.getElementById("avatar-form"),
    modalTitle: document.getElementById("modal-title"),
    imagePreview: document.getElementById("avatar-image-preview"),
    imageUrlInput: document.getElementById("avatar-image-url"),
    saveBtn: document.getElementById("save-avatar"),
  };

  // Initialization
  loadAvatars();
  setupEventListeners();

  // Event Listeners Setup
  function setupEventListeners() {
    elements.prevPageBtn.addEventListener("click", () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        loadAvatars();
      }
    });

    elements.nextPageBtn.addEventListener("click", () => {
      if (state.currentPage * state.pageSize < state.totalAvatars) {
        state.currentPage++;
        loadAvatars();
      }
    });

    elements.statusFilter.addEventListener("change", () => {
      state.currentStatusFilter = elements.statusFilter.value;
      state.currentPage = 1;
      loadAvatars();
    });

    elements.avatarSearch.addEventListener(
      "input",
      debounce(() => {
        state.currentSearch = elements.avatarSearch.value;
        state.currentPage = 1;
        loadAvatars();
      }, 300),
    );

    elements.newAvatarBtn.addEventListener("click", openNewAvatarModal);

    elements.closeModal.addEventListener("click", closeModal);
    elements.cancelEdit.addEventListener("click", closeModal);

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !elements.avatarModal.classList.contains("hidden")
      ) {
        closeModal();
      }
    });

    elements.avatarForm.addEventListener("submit", handleFormSubmit);

    elements.deleteAvatarBtn.addEventListener("click", handleDeleteAvatar);

    // Add file input element for direct uploads
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// Add upload button next to image URL input
const uploadButton = document.createElement('button');
uploadButton.textContent = 'Upload Image';
uploadButton.className = 'ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600';
elements.imageUrlInput.parentNode.appendChild(uploadButton);

uploadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    elements.imageUrlInput.value = data.url;
    elements.imagePreview.src = data.url;
    elements.imagePreview.classList.remove('hidden');
    showNotification('Image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    showNotification('Failed to upload image', 'error');
  } finally {
    uploadButton.disabled = false;
    uploadButton.textContent = 'Upload Image';
    fileInput.value = ''; // Reset file input
  }
});

elements.imageUrlInput.addEventListener("input", () => {
  const url = elements.imageUrlInput.value;
  elements.imagePreview.src = url;
  elements.imagePreview.classList.toggle("hidden", !url);
});
  }

  // Avatar List Functions
  async function loadAvatars() {
    try {
      const params = new URLSearchParams({
        page: state.currentPage,
        limit: state.pageSize,
        status: state.currentStatusFilter,
        model: state.currentModelFilter,
        search: state.currentSearch
      });
      
      const response = await fetch(`/api/avatars?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const avatars = data.avatars || [];
      state.totalAvatars = data.total || 0;

      if (avatars.length === 0) {
        elements.avatarsBody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No avatars found</td></tr>';
      } else {
        renderAvatars(avatars);
      }
      
      updatePagination(state.totalAvatars, data.page || 1, data.limit || state.pageSize);
    } catch (error) {
      console.error("Error loading avatars:", error);
      elements.avatarsBody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-red-500">Failed to load avatars</td></tr>';
    }
  }

  function updatePagination(total, page, limit) {
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    document.getElementById("paginationInfo").textContent =
      `Showing ${start}-${end} of ${total} avatars`;
  }

  function renderAvatars(avatars) {
    if (avatars.length === 0) {
      elements.avatarsBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">No avatars found</td></tr>`;
      return;
    }
    elements.avatarsBody.innerHTML = avatars.map(createAvatarRow).join("");
    setupRowEventListeners();
  }

  function createAvatarRow(avatar) {
    return `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <img class="h-10 w-10 rounded-full object-cover" src="${avatar.thumbnailUrl || avatar.imageUrl || "/default-avatar.png"}" alt="${avatar.name || "Avatar"}">
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${avatar.name || "Unnamed"} ${avatar.emoji || ""}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${avatar._id}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(avatar.status)}">
            ${avatar.status || "Unknown"}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${avatar.model || "Not specified"}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(avatar.createdAt)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <button data-avatar-id="${avatar._id}" class="edit-avatar text-indigo-600 hover:text-indigo-900">Edit</button>
          <button data-avatar-id="${avatar._id}" class="delete-avatar text-red-600 hover:text-red-900 ml-2">Delete</button>
        </td>
      </tr>
    `;
  }

  function setupRowEventListeners() {
    document.querySelectorAll(".edit-avatar").forEach((button) => {
      button.addEventListener("click", () =>
        editAvatar(button.dataset.avatarId),
      );
    });
    document.querySelectorAll(".delete-avatar").forEach((button) => {
      button.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this avatar?")) {
          deleteAvatar(button.dataset.avatarId);
        }
      });
    });
  }

  function updatePagination() {
    const start = (state.currentPage - 1) * state.pageSize + 1;
    const end = Math.min(
      state.currentPage * state.pageSize,
      state.totalAvatars,
    );
    elements.paginationInfo.textContent = `Showing ${start}-${end} of ${state.totalAvatars} avatars`;
    elements.prevPageBtn.disabled = state.currentPage === 1;
    elements.nextPageBtn.disabled = end >= state.totalAvatars;
  }

  // Modal Functions
  function openNewAvatarModal() {
    elements.avatarForm.dataset.avatarId = "";
    elements.modalTitle.textContent = "Create New Avatar";
    elements.deleteAvatarBtn.classList.add("hidden");
    resetForm();
    elements.avatarModal.classList.remove("hidden");
  }

  async function editAvatar(avatarId) {
    try {
      elements.avatarModal.classList.remove("hidden");
      elements.modalTitle.textContent = "Loading Avatar Data...";
      const response = await fetch(`/api/admin/avatars/${avatarId}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const avatar = await response.json();
      elements.modalTitle.textContent = `Edit Avatar: ${avatar.name}`;
      elements.avatarForm.dataset.avatarId = avatarId;
      elements.deleteAvatarBtn.classList.remove("hidden");
      populateForm(avatar);
    } catch (error) {
      console.error("Error fetching avatar:", error);
      closeModal();
      showNotification("Failed to load avatar details", "error");
    }
  }

  function resetForm() {
    elements.avatarForm.reset();
    elements.imagePreview.src = "";
    elements.imagePreview.classList.add("hidden");
    elements.imageUrlInput.value = "";
  }

  function populateForm(avatar) {
    document.getElementById("avatar-name").value = avatar.name || "";
    document.getElementById("avatar-status").value = avatar.status || "alive";
    document.getElementById("avatar-model").value =
      avatar.model || "gemini-2.0-flash";
    document.getElementById("avatar-emoji").value = avatar.emoji || "";
    document.getElementById("avatar-description").value =
      avatar.description || "";
    document.getElementById("avatar-personality").value =
      avatar.personality || "";
    elements.imageUrlInput.value = avatar.imageUrl || "";
    elements.imagePreview.src = avatar.imageUrl || "";
    elements.imagePreview.classList.toggle("hidden", !avatar.imageUrl);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const avatarId = elements.avatarForm.dataset.avatarId;
    const method = avatarId ? "PUT" : "POST";
    const url = avatarId
      ? `/api/admin/avatars/${avatarId}`
      : "/api/admin/avatars";
    const formData = new FormData(elements.avatarForm);
    elements.saveBtn.disabled = true;
    elements.saveBtn.textContent = "Saving...";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      closeModal();
      loadAvatars();
      showNotification(
        avatarId
          ? "Avatar updated successfully"
          : "Avatar created successfully",
      );
    } catch (error) {
      console.error("Error saving avatar:", error);
      showNotification("Failed to save avatar", "error");
    } finally {
      elements.saveBtn.disabled = false;
      elements.saveBtn.textContent = "Save Changes";
    }
  }

  async function handleDeleteAvatar() {
    const avatarId = elements.avatarForm.dataset.avatarId;
    if (!avatarId || !confirm("Are you sure you want to delete this avatar?"))
      return;

    try {
      const response = await fetch(`/api/admin/avatars/${avatarId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      closeModal();
      loadAvatars();
      showNotification("Avatar deleted successfully");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      showNotification("Failed to delete avatar", "error");
    }
  }

  function closeModal() {
    elements.avatarModal.classList.add("hidden");
  }

  // Utility Functions
  function showNotification(message, type = "success") {
    const container = document.createElement("div");
    container.className = "fixed bottom-4 right-4 z-50";
    const notification = document.createElement("div");
    notification.className = `p-3 rounded shadow-lg ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white`;
    notification.textContent = message;
    container.appendChild(notification);
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3000);
  }

  function getStatusColor(status) {
    return (
      {
        alive: "bg-green-100 text-green-800",
        dead: "bg-red-100 text-red-800",
        inactive: "bg-gray-100 text-gray-800",
      }[status] || "bg-gray-100 text-gray-800"
    );
  }

  function formatDate(dateString) {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function loadingSpinner() {
    return `
      <tr>
        <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
          <svg class="animate-spin h-5 w-5 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </td>
      </tr>
    `;
  }
});
