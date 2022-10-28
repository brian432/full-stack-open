module.exports = (error, request, response, next) => {
    if (error.name === "CastError") {
        response.status(400).send({ error: "formato erroneo" })
    } else {
        response.status(400).json({ error: error.message })
    }
    next(error)
}