let Library = require('./library.js');
let cork_city = new Library();

cork_city.lookup("9781472258229"); // => 'Kindred, by Octavia E. Butler (1979)'
cork_city.add("9781472258229");

cork_city.lookup("9780441569595"); // => 'Neuromancer, by William Gibson (1984)'
cork_city.add("9780441569595", 3);

cork_city.borrow("9781472258229"); // Borrow a copy of 'Kindred'
cork_city.borrow("9780441569595"); // Borrow a copy of 'Neuromancer'
cork_city.borrow("9780441569595"); // Borrow another copy of 'Neuromancer'
cork_city.return("9780441569595"); // Return a copy of 'Neuromancer'

cork_city.stock();
// 9780143111597, Copies: 0, Available: 0
// 9781472258229, Copies: 1, Available: 0
// 9780441569595, Copies: 3, Available: 2
// 9781857231380, Copies: 0, Available: 0
// 9780553283686, Copies: 0, Available: 0
