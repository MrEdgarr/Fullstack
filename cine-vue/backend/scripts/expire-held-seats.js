require("dotenv").config();
const { expireStaleHolds } = require("../src/modules/bookings/booking-maintenance.service");

expireStaleHolds()
  .then((result) => {
    console.log(`Expired ${result.expired_booking_count} booking hold(s).`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to expire booking holds:", error);
    process.exit(1);
  });
