import db from "../../shared/config/database.js";

export const getAll = () => db.execute("SELECT * FROM screening_rooms ORDER BY room_name");
export const getById = (id) => db.execute("SELECT * FROM screening_rooms WHERE room_id = ?", [id]);
export const create = (cinema_id, room_name, room_type) =>
  db.execute("INSERT INTO screening_rooms (cinema_id, room_name, room_type) VALUES (?, ?, ?)", [
    cinema_id,
    room_name,
    room_type,
  ]);
export const update = (id, room_name, room_type) =>
  db.execute("UPDATE screening_rooms SET room_name = ?, room_type = ? WHERE room_id = ?", [
    room_name,
    room_type,
    id,
  ]);
export const remove = (id) => db.execute("DELETE FROM screening_rooms WHERE room_id = ?", [id]);
export { remove as delete };
