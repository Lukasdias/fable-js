import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: ['application/pdf', 'text/plain', 'application/json', 'text/xml', 'text/csv', 'text/markdown']
}

function getFileType(mimeType: string): string {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) {
      return category
    }
  }
  return 'unknown'
}

function isAllowedType(mimeType: string): boolean {
  return getFileType(mimeType) !== 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Validate files
    const validatedFiles: { file: File; originalName: string; uniqueName: string; type: string }[] = []
    const errors: string[] = []

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 50MB limit`)
        continue
      }

      // Check file type
      if (!isAllowedType(file.type)) {
        errors.push(`${file.name}: Unsupported file type`)
        continue
      }

      // Generate unique filename
      const extension = file.name.split('.').pop() || ''
      const uniqueName = `${randomUUID()}.${extension}`
      const fileType = getFileType(file.type)

      validatedFiles.push({
        file,
        originalName: file.name,
        uniqueName,
        type: fileType
      })
    }

    if (validatedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files to upload', details: errors },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'assets')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, continue
    }

    // Save files
    const uploadedAssets = []
    for (const { file, originalName, uniqueName, type } of validatedFiles) {
      const filePath = join(uploadsDir, uniqueName)

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        uploadedAssets.push({
          id: randomUUID(),
          originalName,
          uniqueName,
          type,
          size: file.size,
          url: `/uploads/assets/${uniqueName}`,
          uploadedAt: new Date().toISOString()
        })
      } catch (error) {
        console.error(`Failed to save ${originalName}:`, error)
        errors.push(`${originalName}: Failed to save file`)
      }
    }

    return NextResponse.json({
      success: true,
      assets: uploadedAssets,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}