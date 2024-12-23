export const shareLinks = {
    whatsapp: (url, text) => 
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      
    telegram: (url) => 
      `https://telegram.me/share/url?url=${encodeURIComponent(url)}`,
  };