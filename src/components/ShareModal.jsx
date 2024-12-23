import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ShareModal = ({ isOpen, onClose, shareUrl, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard! 🎄');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="input-field flex-1"
          />
          <button
            onClick={handleCopy}
            className={`btn-primary ${copied ? 'bg-green-500' : ''}`}
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Join me on SantaSphere! ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            WhatsApp
          </a>
          <a
            href={`https://telegram.me/share/url?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            Telegram
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;