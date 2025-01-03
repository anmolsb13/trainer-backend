const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const trainers = [
    {
        id: 1,
        name: "John Doe",
        specialty: "Yoga",
        rate: "$50/hr",
        rateValue: 50,
        bio: "Experienced yoga instructor specializing in Vinyasa.",
        certifications: ["RYT 200"]
    },
    {
        id: 2,
        name: "Jane Smith",
        specialty: "Strength Training",
        rate: "$60/hr",
        rateValue: 60,
        bio: "Certified strength coach helping clients build muscle and confidence.",
        certifications: ["CPT", "CSCS"]
    }
];

const fs = require("fs");

// Load bookings from a file at startup
let bookings = [];
try {
    const data = fs.readFileSync("bookings.json");
    bookings = JSON.parse(data);
    console.log("Bookings Loaded:", bookings);
} catch (error) {
    console.log("No existing bookings file found. Starting fresh.");
}

// Save bookings to a file whenever a new booking is added
app.post("/bookings", (req, res) => {
    const { trainerId, clientName, date, time } = req.body;

    if (!trainerId || !clientName || !date || !time) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const booking = {
        id: bookings.length + 1,
        trainerId,
        clientName,
        date,
        time
    };

    bookings.push(booking);
    fs.writeFileSync("bookings.json", JSON.stringify(bookings, null, 2)); // Save to file
    console.log("Booking Added:", booking);
    res.status(201).json({ message: "Booking created", booking });
});



// Get all bookings (with enriched trainer details)
app.get("/bookings", (req, res) => {
    console.log("GET /bookings route triggered"); // Add this log
    const enrichedBookings = bookings.map(booking => {
        const trainer = trainers.find(t => t.id === booking.trainerId);
        console.log("Current Booking:", booking); // Log each booking being processed
        console.log("Matched Trainer:", trainer); // Log the trainer found for the booking
        return {
            ...booking,
            trainerName: trainer ? trainer.name : "Unknown Trainer",
            specialty: trainer ? trainer.specialty : "Unknown Specialty"
        };
    });

    console.log("Enriched Bookings:", enrichedBookings); // Log the final enriched array
    res.json(enrichedBookings);
});



// Get all trainers
app.get("/trainers", (req, res) => {
    res.json(trainers);
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
