import React, { createContext, useContext, useState, ReactNode } from 'react';

interface IdentifiedUser {
  email: string;
  userId: number;
  walletBalance: number;
  name: string;
  cardNumber: string;   // ← NEW
}

interface KioskContextType {
  isKioskMode: boolean;
  setKioskMode: (mode: boolean) => void;
  identifiedUser: IdentifiedUser | null;
  setIdentifiedUser: (user: IdentifiedUser | null) => void;
  clearIdentifiedUser: () => void;
}

const KioskContext = createContext<KioskContextType | undefined>(undefined);

export const KioskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [identifiedUser, setIdentifiedUser] = useState<IdentifiedUser | null>(null);

  const clearIdentifiedUser = () => setIdentifiedUser(null);

  return (
    <KioskContext.Provider
      value={{
        isKioskMode,
        setKioskMode: setIsKioskMode,
        identifiedUser,
        setIdentifiedUser,
        clearIdentifiedUser,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
};

export const useKiosk = () => {
  const context = useContext(KioskContext);
  if (context === undefined) {
    throw new Error('useKiosk must be used within a KioskProvider');
  }
  return context;
};