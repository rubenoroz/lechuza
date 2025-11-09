import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file found' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;

    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public/uploads/resources');
    const filePath = path.join(uploadDir, uniqueFilename);

    // Write the file to the specified directory
    await writeFile(filePath, buffer);

    console.log(`File uploaded to ${filePath}`);

    // Return the public path to the file
    const publicPath = `/uploads/resources/${uniqueFilename}`;
    return NextResponse.json({ success: true, filePath: publicPath, mimeType: file.type, fileSize: file.size });

  } catch (error) {
    console.error('[FILE_UPLOAD_POST]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
