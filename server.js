const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());

const users = [];

const SECRET_KEY = process.env.SECRET_KEY || "your_jwt_secret_key";

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
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ email, password: hashedPassword, role });
        res.status(201).json({ message: "User registered successfully" });
    }
);

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

app.get("/", (req, res) => {
    res.send("Server is running!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
