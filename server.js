const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator"); // Import express-validator

const app = express();
app.use(express.json());

const users = []; // Empty array to store users

const SECRET_KEY = "your_jwt_secret_key"; // Replace with a secure key

// Register Endpoint
app.post(
    "/register",
    // Input Validation
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, role } = req.body; // Role: "client" or "trainer"
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ email, password: hashedPassword, role });
        res.status(201).json({ message: "User registered successfully" });
    }
);

// Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Validate user
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

// Protected Route Example
app.get("/protected", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: "Access granted", data: decoded });
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
});

// Debug Route to Check Server Status
app.get("/", (req, res) => {
    res.send("Server is running!");
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
