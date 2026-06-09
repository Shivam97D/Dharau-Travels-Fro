import { createContext, useContext, useState, ReactNode } from "react";
import { AuthModal } from "@/components/site/AuthModal";

interface AuthModalContextType {
  openAuth: () => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ openAuth: () => setOpen(true), closeAuth: () => setOpen(false) }}>
      {children}
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within an AuthModalProvider");
  return ctx;
}
