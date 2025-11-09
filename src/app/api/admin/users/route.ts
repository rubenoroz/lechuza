import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateMatricula } from '@/lib/matricula';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      nombres, 
      apellido_paterno, 
      apellido_materno, 
      telefono, 
      email, 
      password, 
      isSuperAdmin, // Renamed from isAdmin
      isEnrollmentAdmin, // New field
      isProfesor, 
      isStudent 
    } = await request.json();

    if (!nombres || !apellido_paterno || !email || !password) {
      return NextResponse.json({ message: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let numero_matricula = null;
    if (isStudent) {
      numero_matricula = await generateMatricula(nombres, apellido_paterno, apellido_materno);
    }

    const user = await prisma.user.create({
      data: {
        nombres,
        apellido_paterno,
        apellido_materno,
        telefono,
        email,
        password: hashedPassword,
        isSuperAdmin: isSuperAdmin || false, // Renamed from isAdmin
        isEnrollmentAdmin: isEnrollmentAdmin || false, // New field
        isProfesor: isProfesor || false,
        isStudent: isStudent || false,
        numero_matricula,
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return NextResponse.json({ message: 'El correo electrónico ya está en uso.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error al crear el usuario' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count(),
    ]);

    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      data: usersWithoutPasswords,
      pagination: {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
        pageSize: limit,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}
