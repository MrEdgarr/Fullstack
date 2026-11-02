import express from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import brandsRoutes from "../modules/brands/brands.routes.js";
import citiesRoutes from "../modules/cities/cities.routes.js";
import cinemasRoutes from "../modules/cinemas/cinemas.routes.js";
import roomsRoutes from "../modules/rooms/rooms.routes.js";
import seatsRoutes from "../modules/seats/seats.routes.js";
import moviesRoutes from "../modules/movies/movies.routes.js";
import showtimesRoutes from "../modules/showtimes/showtimes.routes.js";
import customersRoutes from "../modules/customers/customers.routes.js";
import bookingsRoutes from "../modules/bookings/bookings.routes.js";
import ticketsRoutes from "../modules/tickets/tickets.routes.js";
import paymentsRoutes from "../modules/payments/payments.routes.js";
import combosRoutes from "../modules/combos/combos.routes.js";
import promotionsRoutes from "../modules/promotions/promotions.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";

const router = express.Router();

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
router.use("/dashboard", dashboardRoutes);

export default router;
