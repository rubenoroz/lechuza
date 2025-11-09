import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateMatricula } from '@/lib/matricula';

// Helper to get ID from URL
const getIdFromUrl = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};

// GET a single user by ID
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = getIdFromUrl(request.url);
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}

// UPDATE a user by ID
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = getIdFromUrl(request.url);
    const { 
      nombres, 
      apellido_paterno, 
      apellido_materno, 
      telefono, 
      email, 
      password, 
      isSuperAdmin, 
      isEnrollmentAdmin, 
            isProfesor,
            isStudent
          } = await request.json();
    const updateData: any = {
      nombres,
      apellido_paterno,
      apellido_materno,
      telefono,
      email,
      isSuperAdmin,
      isEnrollmentAdmin,
      isProfesor,
      isStudent,
    };

    // 1. Handle password update
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 2. Handle conditional matricula generation
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (isStudent && !existingUser.numero_matricula) {
      updateData.numero_matricula = await generateMatricula(nombres, apellido_paterno, apellido_materno);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE a user by ID
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = getIdFromUrl(request.url);

    if (id === session.user.id) {
      return NextResponse.json({ message: 'You cannot delete your own account.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}