document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById("searchBtn")) {
        document.getElementById("searchBtn").addEventListener("click", function () {
            const departure = document.getElementById("departure").value;
            const arrival = document.getElementById("arrival").value;
            const date = document.getElementById("date").value;

            const infoBox = document.querySelector(".info-box");
            infoBox.innerHTML = "";

            if (!departure || !arrival || !date) {
                alert("Please fill in all fields.");
                return;
            }

            fetch(`http://localhost:3000/rechercher-trips?departure=${departure}&arrival=${arrival}&date=${date}`)
                .then(response => response.json())
                .then(data => {
                    if (data.message === "Aucun trajet trouvé pour ces critères") {
                        infoBox.innerHTML = `<div class="text-center">
                            <img src="images/no-trips.png" width="50">
                            <p class="mt-3">No trip found.</p>
                        </div>`;
                        return;
                    }

                    infoBox.innerHTML = `<h3 class="text-center">Available Trips</h3>
                                         <div class="scrollable-list"></div>`;
                    const resultsContainer = infoBox.querySelector(".scrollable-list");

                    let resultsHTML = "";

                    (data.trips || []).forEach(trip => {
                        resultsHTML += `
                            <div class="trip-card">
                                <span>${trip.departure} > ${trip.arrival} - ${new Date(trip.date).toLocaleTimeString()} - ${trip.price}€</span>
                                <button class="btn btn-success" onclick="fetch('http://localhost:3000/cart/${trip.id}', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' }
                                }).then(response => response.json())
                                  .then(data => alert('Trip added to cart!'))
                                  .catch(error => console.error('Error adding trip to cart:', error));">Book</button>
                            </div>
                        `;
                    });

                    resultsContainer.innerHTML = resultsHTML;
                })
                .catch(error => console.error("Error fetching trips:", error));
        });
    }

    if (document.getElementById("cart-results")) {
        fetch("http://localhost:3000/cart")
            .then(response => response.json())
            .then(data => {

                const cartContainer = document.getElementById("cart-results");
                const totalPriceContainer = document.getElementById("total-price");
                let total = 0;

                if (!data || data.length === 0 || data.message === "Le panier est vide") {
                    cartContainer.innerHTML = `<p class="text-center text-muted">No trips in the cart.</p>`;
                    totalPriceContainer.textContent = "Total: 0€";
                    return;
                }

                let cartHTML = "";
                data.cartTrips.forEach(trip => {
                    total += trip.price;
                    cartHTML += `
                        <div class="cart-item">
                            <span>${trip.departure} > ${trip.arrival} - ${new Date(trip.date).toLocaleTimeString()} - ${trip.price}€</span>
                            <button class="btn btn-danger btn-sm" onclick="fetch('http://localhost:3000/cart/${trip.id}', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                            }).then(response => response.json())
                              .then(() => location.reload())
                              .catch(error => console.error('Error removing trip from cart:', error));">X</button>
                        </div>
                    `;
                });

                cartContainer.innerHTML = cartHTML;
                totalPriceContainer.textContent = `Total: ${total}€`;
            })
            .catch(error => console.error("Error loading cart:", error));

        document.getElementById("purchaseBtn").addEventListener("click", function () {
            fetch("http://localhost:3000/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            })
                .then(response => response.json())
                .then(data => {
                    alert("Purchase successful!");
                    location.reload();
                })
                .catch(error => console.error("Error finalizing purchase:", error));
        });
    }
    if (document.getElementById("bookings-results")) {
        fetch("http://localhost:3000/bookings")
            .then(response => response.json())
            .then(data => {
                console.log("Données reçues pour les réservations :", data); // DEBUG


                const bookingsContainer = document.getElementById("bookings-results");

                if (!data || data.length === 0 || data.message === "Aucune réservation trouvée") {
                    bookingsContainer.innerHTML = `<p class="text-center text-muted">No bookings yet.</p>`;
                    return;
                }

                let bookingsHTML = "";
                (data.bookings || []).forEach(trip => {
                    bookingsHTML += `
                        <div class="cart-item">
                            <span>${trip.departure} > ${trip.arrival} - ${new Date(trip.date).toLocaleTimeString()} - ${trip.price}€</span>
                        </div>
                    `;
                });

                bookingsContainer.innerHTML = bookingsHTML;
            })
            .catch(error => console.error(" Error loading bookings:", error));
    }
});
