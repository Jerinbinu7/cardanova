import { motion } from 'framer-motion';

export default function WhatsAppButton() {
  const handleClick = () => {
    window.open(
      'https://wa.me/919656866090?text=Hello%20Cardanova%20Spices%2C%20I%20am%20interested%20in%20requesting%20a%20cardamom%20export%20quote.',
      '_blank'
    );
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[180] flex items-center justify-center rounded-full shadow-2xl cursor-pointer transition-all"
      style={{ width: '56px', height: '56px', background: '#25D366' }}
      aria-label="Chat on WhatsApp"
    >
      {/* Official WhatsApp SVG logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="white"
        aria-hidden="true"
      >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.651 4.799 1.785 6.809L2 30l7.383-1.752A13.924 13.924 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.538a11.504 11.504 0 0 1-5.868-1.601l-.42-.25-4.38 1.039 1.08-4.266-.274-.437A11.516 11.516 0 0 1 4.462 16C4.462 9.625 9.625 4.462 16 4.462S27.538 9.625 27.538 16 22.375 27.538 16 27.538zm6.318-8.628c-.346-.173-2.048-1.01-2.366-1.126-.317-.115-.548-.173-.779.173-.23.346-.895 1.126-1.097 1.357-.202.23-.404.26-.75.086-.347-.173-1.463-.54-2.787-1.718-1.03-.918-1.725-2.05-1.928-2.396-.202-.347-.021-.534.152-.707.155-.155.346-.404.52-.607.172-.202.23-.346.345-.577.115-.23.058-.433-.029-.607-.086-.173-.779-1.878-1.068-2.571-.281-.676-.567-.584-.779-.594-.202-.01-.433-.012-.664-.012-.23 0-.607.086-.924.433-.317.347-1.212 1.184-1.212 2.888s1.241 3.35 1.414 3.58c.173.23 2.443 3.73 5.917 5.233.827.357 1.472.57 1.975.73.83.264 1.586.227 2.182.138.666-.1 2.048-.837 2.337-1.645.288-.808.288-1.501.202-1.645-.087-.144-.317-.23-.664-.404z" />
      </svg>
    </motion.button>
  );
}
