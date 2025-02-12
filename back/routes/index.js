var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");
const Trips = require("../models/Trips");
const BookingTrips = require("../models/BookingTrips");
const { Op } = require("sequelize");
const moment = require("moment");

router.post("/trips", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../trips.json");
    const tripsData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (const trip of tripsData) {
      const rawDate = trip.date.$date ? trip.date.$date : trip.date;
      const formattedDate = moment(rawDate).format("YYYY-MM-DD HH:mm:ss");

      if (!moment(formattedDate, "YYYY-MM-DD HH:mm:ss", true).isValid()) {
        continue;
      }

      await Trips.create({
        departure: trip.departure,
        arrival: trip.arrival,
        date: formattedDate,
        price: trip.price,
        in_cart: false,
      });
    }

    res.json({ result: true, message: "Importation réussie" });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/rechercher-trips", async (req, res) => {
  try {
    const { departure, arrival, date } = req.query;

    if (!departure || !arrival || !date) {
      return res.json({ result: false, error: "Paramètres manquants" });
    }

    const formattedDate = moment(date, "YYYY-MM-DD", true);
    if (!formattedDate.isValid()) {
      return res.json({ result: false, error: "Format de date invalide" });
    }

    const startOfDay = formattedDate.startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const endOfDay = formattedDate.endOf("day").format("YYYY-MM-DD HH:mm:ss");

    const trips = await Trips.findAll({
      where: {
        departure,
        arrival,
        date: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    res.json(trips.length > 0 ? { result: true, trips } : { result: false, error: "Aucun trajet trouvé" });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.put("/cart/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trips.findByPk(tripId);

    if (!trip) {
      return res.json({ result: false, error: "Trajet non trouvé" });
    }
    await trip.update({ in_cart: true });

    res.json({ result: true, message: "Trajet ajouté au panier", trip });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/cart", async (req, res) => {
  try {
    const cartTrips = await Trips.findAll({ where: { in_cart: true } });
    res.json(cartTrips.length > 0 ? { result: true, cartTrips } : { result: false, error: "Le panier est vide" });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.delete("/cart/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trips.findByPk(tripId);

    if (!trip || !trip.in_cart) {
      return res.json({ result: false, error: "Trajet non trouvé ou pas dans le panier" });
    }
    await trip.update({ in_cart: false });

    res.json({ result: true, message: "Trajet retiré du panier" });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.post("/bookings", async (req, res) => {
  try {
    const cartTrips = await Trips.findAll({ where: { in_cart: true } });
    if (cartTrips.length === 0) {
      return res.json({ result: false, error: "Aucun ticket dans le panier" });
    }

    const bookedTrips = await Promise.all(
        cartTrips.map((trip) =>
            BookingTrips.create({
              departure: trip.departure,
              arrival: trip.arrival,
              date: trip.date,
              price: trip.price,
            })
        )
    );
    await Trips.update({ in_cart: false }, { where: { in_cart: true } });
    res.json({ result: true, message: "Réservation confirmée", bookings: bookedTrips });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await BookingTrips.findAll();
    res.json(bookings.length > 0 ? { result: true, bookings } : { result: false, error: "Aucune réservation" });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

router.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BookingTrips.destroy({ where: { id } });
    res.json(deleted ? { result: true, message: "Réservation supprimée" } : { result: false, error: "Réservation non trouvée" });
  } catch (error) {
    res.json({ result: false, error: "Erreur serveur" });
  }
});

module.exports = router;