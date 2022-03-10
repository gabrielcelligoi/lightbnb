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
const getAllReservations = function(guest_id) {
  return pool.query(`
  SELECT reservations.id, properties.title, reservations.start_date, properties.cost_per_night, AVG(property_reviews.rating) AS average_rating
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date;  
  `, [guest_id])
  .then(data => {
    return data.rows;
  })
  .catch(error => {
    console.log(error.message);
  })
  
}
exports.getAllReservations = getAllReservations;

/// Properties

const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id  
  `;

  if (options.city) {
    if (queryParams.length === 0) {
      queryString += `WHERE `;
    }

    if (queryParams.length !== 0) {
      queryString += `AND `;
    }

    queryParams.push(`%${options.city}%`);
    queryString += `city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    if (queryParams.length === 0) {
      queryString += `WHERE `;
    }

    if (queryParams.length !== 0) {
      queryString += `AND `;
    }

    queryParams.push(options.owner_id);
    queryString += `owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    if (queryParams.length === 0) {
      queryString += `WHERE `;
    }

    if (queryParams.length !== 0) {
      queryString += `AND `;
    }

    queryParams.push(options.minimum_price_per_night * 100);
    queryString += `cost_per_night > $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    if (queryParams.length === 0) {
      queryString += `WHERE `;
    }

    if (queryParams.length !== 0) {
      queryString += `AND `;
    }

    queryParams.push(options.maximum_price_per_night * 100);
    queryString += `cost_per_night < $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    if (queryParams.length === 0) {
      queryString += `WHERE `;
    }

    if (queryParams.length !== 0) {
      queryString += `AND `;
    }

    queryParams.push(options.minimum_rating);
    queryString += `property_reviews.rating > $${queryParams.length} `;

  }


  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams)
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
