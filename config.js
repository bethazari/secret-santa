module.exports = {
    server: {
        ip: "0.0.0.0",
        port: process.env.PORT || 5000
    },
    db: {
        // url: process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/secret-santa",
        nedb: "db"
    }
}