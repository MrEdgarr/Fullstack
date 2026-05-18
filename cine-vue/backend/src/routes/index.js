const express = require("express");
const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const brandsRoutes = require("../modules/brands/brands.routes");
const citiesRoutes = require("../modules/cities/cities.routes");
const cinemasRoutes = require("../modules/cinemas/cinemas.routes");
const roomsRoutes = require("../modules/rooms/rooms.routes");
const seatsRoutes = require("../modules/seats/seats.routes");
const moviesRoutes = require("../modules/movies/movies.routes");
const showtimesRoutes = require("../modules/showtimes/showtimes.routes");
const customersRoutes = require("../modules/customers/customers.routes");
const bookingsRoutes = require("../modules/bookings/bookings.routes");
const ticketsRoutes = require("../modules/tickets/tickets.routes");
const paymentsRoutes = require("../modules/payments/payments.routes");
const combosRoutes = require("../modules/combos/combos.routes");
const promotionsRoutes = require("../modules/promotions/promotions.routes");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cine Vue API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/brands", brandsRoutes);
router.use("/cities", citiesRoutes);
router.use("/cinemas", cinemasRoutes);
router.use("/rooms", roomsRoutes);
router.use("/seats", seatsRoutes);
router.use("/movies", moviesRoutes);
router.use("/showtimes", showtimesRoutes);
router.use("/customers", customersRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/combos", combosRoutes);
router.use("/promotions", promotionsRoutes);

module.exports = router;
