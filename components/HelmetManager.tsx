import React, { useContext, useEffect } from 'react';
import { ServiceContext } from '../context/ServiceContext';

const HelmetManager: React.FC = () => {
  const { settings, loading } = useContext(ServiceContext);

  useEffect(() => {
    if (loading) return;

    // Update title
    document.title = settings.website_name || 'Documentmitra';
    
    // Update favicon
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    if (settings.favicon_url) {
      link.href = settings.favicon_url;
      // Try to guess mime type, default to x-icon
      if (settings.favicon_url.endsWith('.png')) link.type = 'image/png';
      else if (settings.favicon_url.endsWith('.svg')) link.type = 'image/svg+xml';
      else link.type = 'image/x-icon';
    } else {
      // Create a text-based favicon as a data URL
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        const bgColor = '#06b6d4'; // cyan-500
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, 64, 64, 12);
        ctx.fill();
        
        // Text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((settings.favicon_text || 'DM').slice(0, 2), 32, 34); // Centered text with slight offset
      }
      link.href = canvas.toDataURL('image/png');
      link.type = 'image/png';
    }

  }, [settings, loading]);

  return null; // This component doesn't render anything
};

export default HelmetManager;
