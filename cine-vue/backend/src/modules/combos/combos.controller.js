import * as combosRepository from "./combos.repository.js";

export const getActive = async (req, res, next) => {
  try {
    const [rows] = await combosRepository.getActive();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
