import * as cinemasRepository from "./cinemas.repository.js";

export const getAll = async (req, res, next) => {
  try {
    const [rows] = await cinemasRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await cinemasRepository.getById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Cinema not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { brand_id, cinema_name, city_id, address, phone } = req.body;
    await cinemasRepository.create(brand_id, cinema_name, city_id, address, phone);
    res.status(201).json({ success: true, message: "Cinema created successfully" });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { brand_id, cinema_name, city_id, address, phone } = req.body;
    await cinemasRepository.update(req.params.id, brand_id, cinema_name, city_id, address, phone);
    res.json({ success: true, message: "Cinema updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await cinemasRepository.remove(req.params.id);
    res.json({ success: true, message: "Cinema deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { remove as delete };
