// const jwt = require('jsonwebtoken');

// Middleware to check if user is logged in
// const isAuthenticated = (req, res, next) => {
//     let token
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
// ) {
//     token = req.headers.authorization.split(" ")[1];
// }
//     if (!token) {
//         return res.status(401).send('User not authenticated');
//     }
//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send('User not authenticated');
//         }
//         req.userId = decoded.userId;
//         next();
//     });
// };

// module.exports = isAuthenticated;


const jwt = require("jsonwebtoken")
const isAuthenticated = (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
) {
    token = req.headers.authorization.split(" ")[1];
}

  if (!token) return next((401, 'Unauthorized'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send('User not authenticated');
            }
            req.userId = decoded.userId;
            next();  
        });
};


module.exports = { isAuthenticated }