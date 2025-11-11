import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface CustomSessionUser {
  id: string;
  isSuperAdmin?: boolean;
  isEnrollmentAdmin?: boolean;
  isProfesor?: boolean;
  isStudent?: boolean;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface CustomSession extends Session {
  user: CustomSessionUser;
}

export const useCustomSession = () => {
  const { data, status } = useSession();
  return { data: data as CustomSession, status };
};
