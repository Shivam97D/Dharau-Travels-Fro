import { motion } from "framer-motion";

export function FloatingButtons() {
  return (
    <motion.a
      href="https://wa.me/919579265920"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 left-6 z-40 grid h-14 w-14 place-items-center rounded-full shadow-glow"
      aria-label="WhatsApp"
    >
      <img src="/whatsapp-icon.png" alt="WhatsApp" className="h-14 w-14 rounded-full object-cover" />
      <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-green-400" />
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400" />
    </motion.a>
  );
}
