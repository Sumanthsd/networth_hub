import { Router } from 'express';
import multer from 'multer';
import {
  importGoogleSheetHandler,
  importCsvHandler,
  importSampleHandler,
} from '../controllers/importController.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.post('/google-sheet', importGoogleSheetHandler);
router.post('/csv', upload.single('file'), importCsvHandler);
router.post('/sample', importSampleHandler);

export default router;
