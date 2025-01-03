const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());

const trainers = [
    {
        id: 1,
        name: "John Doe",
        specialty: "Yoga",
        rate: "$50/hr",
        rateValue: 50.0,
        bio: "Experienced yoga instructor specializing in Vinyasa.",
        certifications: ["RYT 200"]
    },
    {
        id: 2,
        name: "Jane Smith",
        specialty: "Strength Training",
        rate: "$60/hr",
        rateValue: 60.0,
        bio: "Certified strength coach helping clients build muscle and confidence.",
        certifications: ["CPT", "CSCS"]
    }
];

// 🛠️ GET /trainers Route
app.get("/trainers", (req, res) => {
    res.json(trainers);
});

// Use an in-memory array for demo purposes (replace with a database for production)
const users = [
    {
        email: "test@example.com",
        password: bcrypt.hashSync("password123", 10), // Pre-hashed password
        role: "client"
    }
];

// Use environment variables for security (Render will provide the PORT dynamically)
const SECRET_KEY = process.env.SECRET_KEY || "chewy";

// 🛠️ Register Endpoint
app.post(
    "/register",
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role } = req.body;

        // Check if the user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ email, password: hashedPassword, role });
        res.status(201).json({ message: "User registered successfully" });
    }
);

// 🛠️ Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Find the user
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: "Invalid email or password." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// 🛠️ Protected Route Example
app.get("/protected", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Received Token:", token);

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("Decoded Token:", decoded);
        res.json({ message: "Access granted", data: decoded });
    } catch (err) {
        console.error("Token verification failed:", err);
        res.status(401).json({ error: "Invalid token", details: err.message });
    }
});


// 🛠️ Debug Route to Check Server Status
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// 🛠️ Dynamic PORT for Render
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
