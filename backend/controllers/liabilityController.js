import {
  listLiabilities,
  getLiability,
  createLiabilityEntry,
  updateLiabilityEntry,
  deleteLiabilityEntry,
} from '../services/liabilityService.js';

export async function getLiabilities(req, res, next) {
  try {
    const liabilities = await listLiabilities(req.user.id);
    res.json(liabilities);
  } catch (err) {
    next(err);
  }
}

export async function getLiabilityById(req, res, next) {
  try {
    const liability = await getLiability(req.user.id, Number(req.params.id));
    res.json(liability);
  } catch (err) {
    next(err);
  }
}

export async function createLiabilityHandler(req, res, next) {
  try {
    const created = await createLiabilityEntry(req.user.id, req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateLiabilityHandler(req, res, next) {
  try {
    const updated = await updateLiabilityEntry(
      req.user.id,
      Number(req.params.id),
      req.body
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteLiabilityHandler(req, res, next) {
  try {
    await deleteLiabilityEntry(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

