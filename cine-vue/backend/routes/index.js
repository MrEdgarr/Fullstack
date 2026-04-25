const express = require("express");
const router = express.Router();

// Import tất cả route con
const authRoutes = require("./auth.routes");
const brandsRoutes = require("./brands.routes");
const citiesRoutes = require("./cities.routes");
const cinemasRoutes = require("./cinemas.routes");
const screeningRoomsRoutes = require("./screeningRooms.routes");
const roomSeatConfigsRoutes = require("./roomSeatConfigs.routes");
const seatsRoutes = require("./seats.routes");
const moviesRoutes = require("./movies.routes");
const showtimesRoutes = require("./showtimes.routes");
const customersRoutes = require("./customers.routes");
const bookingsRoutes = require("./bookings.routes");
const ticketsRoutes = require("./tickets.routes");
const paymentsRoutes = require("./payments.routes");

// Mount routes với prefix
router.use("/auth", authRoutes);
router.use("/brands", brandsRoutes);
router.use("/cities", citiesRoutes);
router.use("/cinemas", cinemasRoutes);
router.use("/rooms", screeningRoomsRoutes);
router.use("/room-configs", roomSeatConfigsRoutes);
router.use("/seats", seatsRoutes);
router.use("/movies", moviesRoutes);
router.use("/showtimes", showtimesRoutes);
router.use("/customers", customersRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/payments", paymentsRoutes);

module.exports = router;
