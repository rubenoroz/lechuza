import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Extiende el tipo User para incluir las nuevas capacidades booleanas.
   */
  interface User {
    id: string;
    isSuperAdmin?: boolean;
    isEnrollmentAdmin?: boolean;
    isProfesor?: boolean;
    isStudent?: boolean;
  }

  /**
   * Extiende la sesión para incluir las propiedades personalizadas en el objeto user.
   */
  interface Session {
    user: {
      id: string;
      isSuperAdmin?: boolean;
      isEnrollmentAdmin?: boolean;
      isProfesor?: boolean;
      isStudent?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  /** Extiende el token JWT para incluir las capacidades booleanas y el id. */
  interface JWT {
    id: string;
    isSuperAdmin?: boolean;
    isEnrollmentAdmin?: boolean;
    isProfesor?: boolean;
    isStudent?: boolean;
  }
}