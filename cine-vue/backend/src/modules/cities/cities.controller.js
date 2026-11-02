import * as citiesRepository from "./cities.repository.js";

export const getAll = async (req, res, next) => {
  try {
    const [rows] = await citiesRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const [rows] = await citiesRepository.getById(req.params.id);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { city_name, country, province_code } = req.body;
    await citiesRepository.create(city_name, country, province_code);
    res.status(201).json({ success: true, message: "City created successfully" });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { city_name, country, province_code } = req.body;
    await citiesRepository.update(req.params.id, city_name, country, province_code);
    res.json({ success: true, message: "City updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await citiesRepository.remove(req.params.id);
    res.json({ success: true, message: "City deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { remove as delete };
