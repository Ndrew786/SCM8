
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, AppPermission } from '../types';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: AppPermission) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserInternal] = useState<User | null>(null);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserInternal(user);
  };
  
  const hasPermission = useCallback((permission: AppPermission): boolean => {
    if (!currentUser) return false;
    return !!currentUser.permissions[permission];
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
