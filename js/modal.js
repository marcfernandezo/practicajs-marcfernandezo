const modal = document.querySelector('#modal');
const modalMessage = document.querySelector('#modal-message');

export const showModal = (message) => {
  modalMessage.textContent = message;
  modal.showModal();
};
