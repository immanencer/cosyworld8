/**
 * Modal component
 * Handles creation and management of modal dialogs
 */

import { UI_CONFIG } from '../core/config.js';
import { setModalOpen } from '../core/state.js';

/**
 * Show a modal dialog
 * @param {Object} options - Modal options
 * @param {string} options.id - Modal element ID
 * @param {string} options.title - Modal title
 * @param {string} options.content - Modal content HTML
 * @param {Function} options.onClose - Callback when modal is closed
 * @param {boolean} options.showClose - Whether to show close button
 * @param {string} options.size - Modal size (sm, md, lg, xl)
 */
export function showModal({
  id = 'modal-container',
  title = '',
  content = '',
  onClose = null,
  showClose = true,
  size = 'md'
}) {
  const modal = document.getElementById(id);
  if (!modal) return;
  
  const modalContent = document.getElementById(`${id}-content`) || modal.querySelector('.modal-content');
  if (!modalContent) return;
  
  // Get the size class based on the size parameter
  const sizeClass = getModalSizeClass(size);
  
  // Build the modal content
  let contentHTML = '';
  
  if (title || showClose) {
    contentHTML += `
      <div class="flex justify-between items-center p-4 border-b border-gray-700">
        ${title ? `<h3 class="text-xl font-bold">${title}</h3>` : '<div></div>'}
        ${showClose ? `
          <button class="modal-close text-gray-400 hover:text-white" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }
  
  contentHTML += `<div class="p-4">${content}</div>`;
  
  // Update modal content
  modalContent.className = `bg-gray-800 rounded-xl shadow-2xl ${sizeClass} overflow-y-auto`;
  modalContent.innerHTML = contentHTML;
  
  // Add event listeners
  const closeBtn = modalContent.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(id, onClose));
  }
  
  // Add click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(id, onClose);
    }
  });
  
  // Show the modal with animation
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  // Set global state
  setModalOpen(true);
  
  // Add animation classes
  modalContent.classList.add('modal-enter');
  setTimeout(() => {
    modalContent.classList.remove('modal-enter');
    modalContent.classList.add('modal-enter-active');
  }, 10);
}

/**
 * Close a modal dialog
 * @param {string} id - Modal element ID
 * @param {Function} onClose - Callback when modal is closed
 */
export function closeModal(id = 'modal-container', onClose = null) {
  const modal = document.getElementById(id);
  if (!modal) return;
  
  const modalContent = document.getElementById(`${id}-content`) || modal.querySelector('.modal-content');
  if (!modalContent) return;
  
  // Add exit animation classes
  modalContent.classList.add('modal-exit');
  setTimeout(() => {
    modalContent.classList.remove('modal-exit');
    modalContent.classList.add('modal-exit-active');
    
    // Hide modal after animation completes
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      modalContent.classList.remove('modal-exit-active');
      
      // Set global state
      setModalOpen(false);
      
      // Execute onClose callback if provided
      if (typeof onClose === 'function') {
        onClose();
      }
    }, UI_CONFIG.MODAL_ANIMATION_DURATION);
  }, 10);
}

/**
 * Create a confirmation modal
 * @param {Object} options - Confirmation options
 * @param {string} options.title - Confirmation title
 * @param {string} options.message - Confirmation message
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.cancelText - Cancel button text
 * @param {Function} options.onConfirm - Callback when confirmed
 * @param {Function} options.onCancel - Callback when canceled
 */
export function confirm({
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClass = 'bg-blue-600 hover:bg-blue-700',
  onConfirm = null,
  onCancel = null
}) {
  const content = `
    <div class="py-4">
      <p class="text-gray-300">${message}</p>
      <div class="flex justify-end gap-2 mt-6">
        <button id="modal-cancel" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
          ${cancelText}
        </button>
        <button id="modal-confirm" class="px-4 py-2 ${confirmClass} text-white rounded">
          ${confirmText}
        </button>
      </div>
    </div>
  `;
  
  showModal({
    title,
    content,
    onClose: onCancel,
    size: 'sm'
  });
  
  // Add event listeners
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn = document.getElementById('modal-cancel');
  
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeModal();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeModal();
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
  }
}

/**
 * Get CSS class for modal size
 * @param {string} size - Size identifier
 * @returns {string} - CSS classes
 */
function getModalSizeClass(size) {
  switch (size) {
    case 'sm': return 'max-w-lg w-full max-h-[80vh]';
    case 'md': return 'max-w-2xl w-full max-h-[85vh]';
    case 'lg': return 'max-w-4xl w-full max-h-[90vh]';
    case 'xl': return 'max-w-6xl w-full max-h-[90vh]';
    default: return 'max-w-2xl w-full max-h-[85vh]';
  }
}