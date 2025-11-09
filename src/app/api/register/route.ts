import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { generateMatricula } from '@/lib/matricula';

export async function POST(request: Request) {
  try {
    const { nombres, apellido_paterno, apellido_materno, telefono, email, password } = await request.json();

    // Basic validation
    if (!nombres || !apellido_paterno || !email || !password) {
      return NextResponse.json({ message: 'Los campos nombre, apellido paterno, email y contraseña son obligatorios.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'El correo electrónico ya está en uso.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique matricula
    const numero_matricula = await generateMatricula(nombres, apellido_paterno, apellido_materno);

    // Create user
    const user = await prisma.user.create({
      data: {
        nombres,
        apellido_paterno,
        apellido_materno,
        telefono,
        email,
        password: hashedPassword,
        numero_matricula,
        isStudent: true, // All public registrations are students
      },
    });

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error en el registro de usuario:', error);
    return NextResponse.json({ message: 'Ocurrió un error en el servidor al intentar registrar el usuario.' }, { status: 500 });
  }
}