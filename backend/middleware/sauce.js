
  
exports.isValidHeat = (heat) => {
    if ( heat <= 10 && heat >= 0 ) {
        return true}
        else {
            return false }
}

exports.isValidSauceSchema = (req) => {

    const neededKeys = ['name',
    'manufacturer',
    'description',
    'mainPepper',
    'heat',
    'userId'];

    if ((neededKeys.every(elem => Object.keys(req).includes(elem)))) 
        return true
  
}