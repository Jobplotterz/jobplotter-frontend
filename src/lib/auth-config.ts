export const getRedirectUrl = () => {
  const origin = window.location.origin;
  const path = "/dashboard"; // Direct to dashboard after login
  
  if (import.meta.env.DEV) {
    return `${origin}${path}`;
  }
  return import.meta.env.VITE_PROD_URL ? `${import.meta.env.VITE_PROD_URL}${path}` : `${origin}${path}`;
};
