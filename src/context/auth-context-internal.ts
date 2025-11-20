import { createContext } from 'react';
import { AuthContextType } from './auth-context';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);