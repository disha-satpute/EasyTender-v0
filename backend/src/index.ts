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

// 3. Update document (Rename)
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: { name: name },
      include: { versions: { orderBy: { versionNum: 'desc' } } }
    });
    return res.json(document);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update document' });
  }
});

// 4. Search text in Document
app.post('/api/documents/:id/search', async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { versionNum: 'desc' }, take: 1 } }
    });

    if (!document || document.versions.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { searchText } = req.body;
    const latestVersion = document.versions[0];

    // Call python service
    const pyRes = await fetch('http://localhost:8000/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey: latestVersion.fileKey,
        searchText: searchText
      })
    });

    if (!pyRes.ok) throw new Error('Python service failed');
    const data = await pyRes.json();
    return res.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// 4. Replace text in Document
app.post('/api/documents/:id/replace', async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { versionNum: 'desc' }, take: 1 } }
    });

    if (!document || document.versions.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { findText, replaceText, matchIndex } = req.body;
    const latestVersion = document.versions[0];

    // Call python service
    const pyRes = await fetch('http://localhost:8000/replace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey: latestVersion.fileKey,
        findText,
        replaceText,
        matchIndex
      })
    });

    if (!pyRes.ok) throw new Error('Python service failed');
    const data = await pyRes.json();

    if (data.success) {
      // Create a new version in the database
      const newVersionNum = latestVersion.versionNum + 1;
      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          versionNum: newVersionNum,
          fileKey: data.newFileKey
        }
      });
      
      // Return updated document
      const updatedDoc = await prisma.document.findUnique({
        where: { id: document.id },
        include: { versions: { orderBy: { versionNum: 'desc' } } }
      });
      return res.json(updatedDoc);
    } else {
      return res.status(400).json({ error: 'Replace failed or no matches found' });
    }
  } catch (error) {
    console.error('Replace error:', error);
    return res.status(500).json({ error: 'Replace failed' });
  }
});

// 5. Add Text to Document
app.post('/api/documents/:id/add-text', async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { versionNum: 'desc' }, take: 1 } }
    });

    if (!document || document.versions.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { text, x, y, page } = req.body;
    const latestVersion = document.versions[0];

    // Call python service
    const pyRes = await fetch('http://localhost:8000/add-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey: latestVersion.fileKey,
        text,
        x,
        y,
        page
      })
    });

    if (!pyRes.ok) throw new Error('Python service failed');
    const data = await pyRes.json();

    if (data.success) {
      // Create a new version in the database
      const newVersionNum = latestVersion.versionNum + 1;
      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          versionNum: newVersionNum,
          fileKey: data.newFileKey
        }
      });
      
      // Return updated document
      const updatedDoc = await prisma.document.findUnique({
        where: { id: document.id },
        include: { versions: { orderBy: { versionNum: 'desc' } } }
      });
      return res.json(updatedDoc);
    } else {
      return res.status(400).json({ error: 'Add text failed' });
    }
  } catch (error) {
    console.error('Add text error:', error);
    return res.status(500).json({ error: 'Add text failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
