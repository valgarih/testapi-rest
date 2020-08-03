'use strict'
const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const Restaurant = require('./models/restaurants')
const π = Math.PI, cos = Math.cos;
const R = 6371e3;
const app = express();
const port = process.env.PORT || 3002

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Read all files to DB
app.get('/api/restaurants', (req, res) => {
    Restaurant.find({}, (err, restaurant) => {
        if (err) return res.status(500).send({ message: `Error al ver la informacion ${err}` })
        if (!restaurant) return res.status(404).send({ message: `No existe información ` })
        res.status(200).send({ restaurant })
    })

})

//Read one file to DB by ID 
app.get('/api/restaurants/:id', (req, res) => {
    let id = req.params.id
    Restaurant.findById(id, (err, restaurant) => {
        if (err) return res.status(500).send({ message: `Error al ver la informacion ${err}` })
        if (!restaurant) return res.status(404).send({ message: `No existe ese ID en la base de datos` })
        res.status(200).send({ "restaurant": restaurant })
    })
})

//Create a new file into the DB
app.post('/api/restaurants', (req, res) => {
    console.log('POST /api/restaurants')
    console.log(req.body)

    let rest = new Restaurant()
    rest.id = req.body.id;
    rest.rating = req.body.rating;
    rest.name = req.body.name;
    rest.site = req.body.site;
    rest.email = req.body.email;
    rest.phone = req.body.phone;
    rest.street = req.body.street;
    rest.city = req.body.city;
    rest.state = req.body.state;
    rest.lat = req.body.lat;
    rest.lng = req.body.lng;

    rest.save((err, restaurantStored) => {
        if (err) {
            res.status(500).send({ message: `Error al guardar la informacion ${err}` })
        } else {
            res.status(200).send({ rest: restaurantStored })
        }
    })

})

//Update one file into the DB
app.put('/api/restaurants/:id', (req, res) => {
    let id = req.params.id
    let update = req.body

    Restaurant.findByIdAndUpdate(id, update, (err, productUpdate) => {
        if (err) return res.status(500).send({ message: `Error al actualizar la informacion ${err}` })

        res.status(200).send({ restaurant: productUpdate })
    })

})

//Delete one file into the DB 
app.delete('/api/restaurants/:id', (req, res) => {
    let id = req.params.id
    Restaurant.findById(id, (err, restaurant) => {
        if (err) return res.status(500).send({ message: `Error al borrar la informacion ${err}` })

        restaurant.remove(err => {
            if (err) return res.status(500).send({ message: `Error al borrar la informacion ${err}` })
            res.status(200).send({ message: `Se ha borrado la información  ${restaurant}` })
        })
    })

})


//Second task 

app.get('/api/restaurants/statistics', async (req, res) => {
    let lat = parseFloat(req.query.latitude)
    let lng = parseFloat(req.query.longitude)
    let radius = parseFloat(req.query.radius)

    let minLat = lat - radius / R * 180 / π
    let maxLat = lat + radius / R * 180 / π
    let minLng = lng - radius / R * 180 / π / cos(lat * π / 180)
    let maxLng = lng + radius / R * 180 / π / cos(lat * π / 180)

    const rest = await Restaurant.aggregate([{
        $addFields: {
            latitude: {
                $toDecimal: "$lat"
            },
            longitude: {
                $toDecimal: "$lng"
            }
        }
    },
    {
        $project: {
            "isInLat": {
                $and: [{
                    $gte: ["latitude.$numberDecimal", minLat]
                },
                {
                    $lte: ["latitude.$numberDecimal", maxLat]
                }]
            },
            "isInLng": {
                $and: [{
                    $gte: ["longitude.$numberDecimal", minLng]
                },
                {
                    $lte: ["longitude.$numberDecimal", maxLng]
                }]
            }
        }
    }
    ])

    res.status(200).send(rest);
    // Restaurant.find()



})


//Conection to the DB 
mongoose.connect('mongodb+srv://valery:MARIOteamo0509@cluster0.bh8pl.mongodb.net/restaurants?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(db => console.log('DB connected'))
    .catch(err => console.log(err))

// mongoose.connect('', { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
//     if (err) throw err
//     console.log('Conexión a la base de datos establecida .. ')

// })
app.listen(port, () => {
    console.log(`API REST corriendo en http://localhost:${port}`)
})

