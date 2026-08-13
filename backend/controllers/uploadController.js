exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file received" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/uploads/${req.file.filename}`;

    res.status(201).json({ url });
};
