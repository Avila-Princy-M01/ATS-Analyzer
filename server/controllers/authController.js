import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.js";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        res.json({ message: "Registered successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
