const citiesRepository = require("./cities.repository");

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await citiesRepository.getAll();
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
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

exports.create = async (req, res, next) => {
  try {
    const { city_name, country, province_code } = req.body;
    await citiesRepository.create(city_name, country, province_code);
    res.status(201).json({ success: true, message: "City created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { city_name, country, province_code } = req.body;
    await citiesRepository.update(req.params.id, city_name, country, province_code);
    res.json({ success: true, message: "City updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await citiesRepository.delete(req.params.id);
    res.json({ success: true, message: "City deleted successfully" });
  } catch (error) {
    next(error);
  }
};
