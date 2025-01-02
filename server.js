const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Welcome to the Trainer Backend!");
});


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

const bookings = [];

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
    res.status(201).json({ message: "Booking created", booking });
});

app.get("/bookings", (req, res) => {
    res.json(bookings);
});


app.get("/trainers", (req, res) => {
    res.json(trainers);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
