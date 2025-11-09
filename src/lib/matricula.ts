import { format } from 'date-fns';
import prisma from '@/lib/prisma';

/**
 * Generates a unique student ID (numero_matricula).
 * Format: YYMMDD + Initial(ApellidoPaterno) + Initial(ApellidoMaterno) + Initial(Nombres)
 * Handles collisions by appending a counter.
 * Example: 251108OPR
 */
export async function generateMatricula(
  nombres: string, 
  apellido_paterno: string, 
  apellido_materno?: string
): Promise<string> {
  const datePart = format(new Date(), 'yyMMdd');
  const initial1 = apellido_paterno.charAt(0).toUpperCase();
  const initial2 = (apellido_materno || 'X').charAt(0).toUpperCase();
  const initial3 = nombres.charAt(0).toUpperCase();
  
  const baseMatricula = `${datePart}${initial1}${initial2}${initial3}`;
  let finalMatricula = baseMatricula;
  let counter = 1;

  // Check for collisions and append a counter if necessary
  while (await prisma.user.findUnique({ where: { numero_matricula: finalMatricula } })) {
    finalMatricula = `${baseMatricula}${counter}`;
    counter++;
  }

  return finalMatricula;
}