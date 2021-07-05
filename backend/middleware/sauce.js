
  
exports.isValidHeat = (heat) => {
    try {
    if ( heat <= 10 && heat >= 0 ) {
        return true}
        else {
            return false }
        }
            catch {
                res.status(500).json({
                  message: " Oups ! Un problème est survenu lors de votre requête  "
                })
            
              }
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