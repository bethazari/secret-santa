module.exports = {
    server: {
        ip: "0.0.0.0",
        port: process.env.PORT || 5000
    },
    db: {
        url: "mongodb://secret-santa:qwerty12345@ds145562.mlab.com:45562/secret-santa",
        //nedb: "db"
    }
}