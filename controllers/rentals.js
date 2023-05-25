const Rental = require('../models/rental');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const rentals = await Rental.find({}).populate('popupText');
    res.render('rentals/index', { rentals })
}

module.exports.renderNewForm = (req, res) => {
    res.render('rentals/new');
}

module.exports.createRental = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.rental.location,
        limit: 1
    }).send()
    const rental = new Rental(req.body.rental);
    rental.geometry = geoData.body.features[0].geometry;
    rental.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    rental.author = req.user._id;
    await rental.save();
    req.flash('success', 'Successfully made a new rental!');
    res.redirect(`/rentals/${rental._id}`)
}

module.exports.showRental = async (req, res,) => {
    const rental = await Rental.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!rental) {
        req.flash('error', 'Cannot find that rental!');
        return res.redirect('/rentals');
    }
    res.render('rentals/show', { rental });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const rental = await Rental.findById(id)
    if (!rental) {
        req.flash('error', 'Cannot find that rental!');
        return res.redirect('/rentals');
    }
    res.render('rentals/edit', { rental });
}

module.exports.updateRental = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const rental = await Rental.findByIdAndUpdate(id, { ...req.body.rental });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    rental.images.push(...imgs);
    await rental.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await rental.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated rental!');
    res.redirect(`/rentals/${rental._id}`)
}

module.exports.deleteRental = async (req, res) => {
    const { id } = req.params;
    await Rental.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted rental')
    res.redirect('/rentals');
}