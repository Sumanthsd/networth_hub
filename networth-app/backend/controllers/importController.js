import { importFromGoogleSheet } from '../services/googleSheetService.js';
import { importFromCsvText } from '../services/fileImportService.js';

const BUILTIN_SAMPLE_CSV = `Type,Category,Name,Amount,Notes
Asset,Mutual Funds,Axis ELSS,89043.628,
Asset,Mutual Funds,Aditya ELSS,75849.12,
Asset,Mutual Funds,Mirae ELSS,82643.3,
Asset,Mutual Funds,SBI Liquid,5050.18,
Asset,Mutual Funds,Axis Liquid,10054.88,
Asset,Mutual Funds,Axis Small Cap,15524.39,
Asset,Mutual Funds,HDFC Flexi Cap,23156.28,
Asset,Mutual Funds,Paragh Flexi Cap,11880.17,
Asset,Stocks,AadhaarFC,22670.45,
Asset,Stocks,BectorFood,32552.87,
Asset,Stocks,BharathGear,8602.62,
Asset,Stocks,Gael,8334.54,
Asset,Stocks,Irfc,1342.2,
Asset,Stocks,ITBees,5705.38,
Asset,Stocks,KMC,7700.42,
Asset,Stocks,TataSteel,4391.73,
Asset,Stocks,GoldBees,3318,
Asset,Stocks,SkyGold,5964,
Asset,Stocks,Titagarh,13770.9,
Asset,Provident Fund,PF Amount (50%),475829,
Asset,Cash,Savings,430000,
Asset,Cash,Advance,100000,
Asset,Vehicle,Car,850000,From old snapshot
Asset,Cash,Cash & Bank,295537,From old snapshot
`;

export async function importGoogleSheetHandler(req, res, next) {
  try {
    const { sheetUrl, sheetName } = req.body;
    const result = await importFromGoogleSheet(req.user.id, {
      sheetUrl,
      sheetName,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function importCsvHandler(req, res, next) {
  try {
    if (!req.file) {
      const error = new Error('CSV file is required');
      error.status = 400;
      throw error;
    }
    const csvText = req.file.buffer.toString('utf-8');
    const result = await importFromCsvText(req.user.id, csvText);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function importSampleHandler(req, res, next) {
  try {
    const result = await importFromCsvText(req.user.id, BUILTIN_SAMPLE_CSV);
    res.json({ ...result, source: 'builtin-sample' });
  } catch (err) {
    next(err);
  }
}
