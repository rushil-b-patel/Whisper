import toast from 'react-hot-toast';

export const showSuccess = (message = 'Success!') =>
  toast.success(message, { position: 'bottom-right' });

export const showError = (message = 'Something went wrong!') =>
  toast.error(message, { position: 'bottom-right' });

export const showLoading = (message = 'Loading...') =>
  toast.loading(message, { position: 'bottom-right' });

export const dismiss = () => toast.dismiss();
