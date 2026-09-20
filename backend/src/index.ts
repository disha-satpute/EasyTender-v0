import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Setup local storage directories
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

app.use(cors());
app.use(express.json());

// Serve uploaded PDFs as static files
app.use('/uploads', express.static(UPLOADS_DIR));

// --- ROUTES ---

// 1. Upload Document
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
    }

    // Since we don't have auth yet, we'll use a dummy user ID or create one if it doesn't exist
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@easytender.com',
          name: 'Demo Contractor'
        }
      });
    }

    // Create Document record
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        name: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        processingStatus: 'PROCESSING', // We'll trigger python service asynchronously
      }
    });

    // Create initial version
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNum: 1,
        fileKey: file.filename
      }
    });

    // TODO: Call Python service to analyze & extract
    // For now, simulate a fast success
    await prisma.document.update({
      where: { id: document.id },
      data: { processingStatus: 'READY' }
    });

    // Fetch the complete document with its versions to return
    const completeDocument = await prisma.document.findUnique({
      where: { id: document.id },
      include: { versions: true }
    });

    return res.status(201).json(completeDocument);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error during upload.' });
  }
});

// 2. Get all Documents
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: { versions: true },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch documents.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
