module.exports = {
    server: {
        ip: process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0",
        port: process.env.OPENSHIFT_NODEJS_PORT || 80
    },
    db: {
        // url: process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/secret-santa",
        nedb: "db"
    }
}