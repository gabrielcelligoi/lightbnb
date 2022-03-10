const propertiesJson = require('./json/properties.json'); //the name of this variable was alterated to not confuse with properties from DB
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

//TEST:
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

/// Users

const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT *
  FROM users
  WHERE email = $1;
  `, [email])
  .then(data => {
    return data.rows[0];
  })
  .catch(error => {
    console.log(error.message);
  });
};
  

exports.getUserWithEmail = getUserWithEmail;

const getUserWithId = function(id) {
  return pool.query(`
  SELECT *
  FROM users
  WHERE id = $1
  `, [id])
  .then(data => {
    return data.rows[0];
  })
  .catch(error => {
    console.log(error.message);
  });  
};
exports.getUserWithId = getUserWithId;


const addUser =  function(user) {
  const userName = user.name;
  const userEmail = user.email;
  const userPassword = user.password;
  const bind = [userName, userEmail, userPassword];

return pool.query(`
INSERT INTO users (name, email, password)
VALUES ($1, $2, $3)
RETURNING *;
`, bind)
.then(data => {
  return data.rows[0];
})
.catch(error => {
  console.log(error.message);
});
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

const getAllProperties = function(options, limit = 10) {
  return pool.query(`
  SELECT *
  FROM properties
  LIMIT $1;
  `, [limit])
  .then((result) => {    
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
  
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(propertiesJson).length + 1;
  property.id = propertyId;
  propertiesJson[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
