import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(dirname(fileURLToPath(import.meta.url)), '../../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, 'uploaded.pdf');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Route to handle PDF upload and mindmap generation
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Spawn Python process to generate mindmaps
    const pythonProcess = spawn('python', [
      path.join(dirname(fileURLToPath(import.meta.url)), '../../../Omex/mindmaps app.py'),
      req.file.path
    ]);

    let mindmapData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      mindmapData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          error: 'Failed to generate mindmap',
          details: errorData
        });
      }

      try {
        const mindmaps = JSON.parse(mindmapData);
        res.json({
          success: true,
          mindmaps: mindmaps
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to parse mindmap data',
          details: error.message
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
});

export default router;