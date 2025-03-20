// Toast Notification System
const Toast = (() => {
  // Container for toast messages
  const container = document.getElementById('toast-container');
  
  // Show a toast message
  function show(message, type = 'info', duration = 3000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add(
      'toast', 
      'max-w-md', 
      'rounded-lg', 
      'shadow-lg', 
      'px-4', 
      'py-3', 
      'flex', 
      'items-center', 
      'justify-between',
      'transform',
      'transition-all',
      'duration-300',
      'ease-in-out',
      'translate-y-2',
      'opacity-0'
    );
    
    // Set background color based on type
    switch (type) {
      case 'success':
        toast.classList.add('bg-green-600', 'text-white');
        break;
      case 'error':
        toast.classList.add('bg-red-600', 'text-white');
        break;
      case 'warning':
        toast.classList.add('bg-yellow-500', 'text-white');
        break;
      case 'info':
      default:
        toast.classList.add('bg-primary-600', 'text-white');
    }
    
    // Add icon based on type
    let icon = '';
    switch (type) {
      case 'success':
        icon = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        `;
        break;
      case 'error':
        icon = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;
        break;
      case 'warning':
        icon = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        `;
        break;
      case 'info':
      default:
        icon = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `;
    }
    
    // Add content
    toast.innerHTML = `
      <div class="flex items-center">
        ${icon}
        <span>${message}</span>
      </div>
      <button class="ml-4 text-white hover:text-gray-100 focus:outline-none toast-close">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Add close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
      closeToast(toast);
    });
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);
    
    // Auto-remove after duration
    setTimeout(() => {
      closeToast(toast);
    }, duration);
    
    // Return toast element
    return toast;
  }
  
  // Close a toast message
  function closeToast(toast) {
    // Animate out
    toast.classList.add('translate-y-2', 'opacity-0');
    
    // Remove after animation completes
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
  
  // Return public methods
  return {
    show
  };
})();

export function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.log('Toast message (no container):', message);
    alert(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast bg-gray-800 text-white p-3 rounded shadow";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode === container) {
      toast.remove();
    }
  }, 3000);
}
