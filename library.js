const fs = require('fs');
const csvToJson = require('convert-csv-to-json');

module.exports = class Library {

    /**
     * This is a simple Library class.
     * 
     * Can be used to lookup, add, return and borrow books.
     * 
     * new instance of class only creates bookStock.json if it has not been created
     */
    constructor() {
        if (!fs.existsSync('bookStock.json')) {
            this.init();
        }
    }

    /**
     *  This creates a bookStock.json file to be used as a persistent
     *  data library as opposed to something like mongo db
     *  this method was chosen for ease of use on code reviewers side.
     */
    init() {
        let catalogFixed = 'catalogFixed.csv';
        // here we fix the given catalog.csv with proper titles
        var data = fs.readFileSync('catalog.csv'); // input csv
        var fd = fs.openSync(catalogFixed, 'w+'); // output csv
        var buffer = Buffer.from('ISBN,Title,Author,Year\n');
        fs.writeSync(fd, buffer, 0, buffer.length, 0); // write header
        fs.writeSync(fd, data, 0, data.length, buffer.length); // append original data
        fs.close(fd);

        let catalogFixedJson = csvToJson.fieldDelimiter(',').getJsonFromCsv(catalogFixed);

        // adding columns as if json is a db
        catalogFixedJson.forEach(book => {
            book.Copies = 0;
            book.Available = 0;
        }
        );
        this.updateJsonFile('bookStock.json', catalogFixedJson);
    }

    /**
     * 
     * @param {*} isbn the isbn of the book to be looked up
     * example usage: cork_city.lookup("9781472258229");
     * 
     * @returns book info if found, otherwise returns "Book not found"
     */
    lookup(isbn) {
        let parsedJson = this.getParsedJsonFromFile('bookStock.json');
        let book = parsedJson.find(book => book.ISBN === isbn);

        if (book === undefined) {
            console.log("Book not found");
        } else {
            let bookInfo = `${book.Title}, by ${book.Author} (${book.Year})`;
            console.log(bookInfo);
        }
    }

    /**
     * 
     * @param {*} isbn the isbn of the book to be add stock
     * @param {*} quantity Number of books to be addded to stock. Adds 1 if omitted.
     * 
     * example usage: cork_city.add("9781472258229", 2);
     * 
     * adds given number of books if book is present, otherwise prints out "Book not found"
     */
    add(isbn, quantity = 1) {
        let parsedJson = this.getParsedJsonFromFile('bookStock.json');

        let indexOfBookInJsonArray = parsedJson.findIndex(book => book.ISBN === isbn);
        if (indexOfBookInJsonArray == -1) {
            console.log("Book not found");
        } else {
            parsedJson[indexOfBookInJsonArray].Copies += quantity;
            parsedJson[indexOfBookInJsonArray].Available += quantity;

            this.updateJsonFile('bookStock.json', parsedJson);

            let stockAddedMessage = `
                ${parsedJson[indexOfBookInJsonArray].Title} has been added to stock. 
                Current stock: ${parsedJson[indexOfBookInJsonArray].Copies}, 
                available: ${parsedJson[indexOfBookInJsonArray].Available}
            `;
            console.log(stockAddedMessage);
        }
    }

    /**
     * Prints out all books with given info, 
     * 
     * Title,Author,Year and stock from database.
     */
    stock() {
        let parsedJson = this.getParsedJsonFromFile('bookStock.json');
        parsedJson.forEach(book => {
            console.log(`
                ${book.Title}, by ${book.Author} (${book.Year}): 
                ${book.Available} available, of ${book.Copies} copies
            `);
        });
    }

    /**
     * 
     * @param {*} isbn the isbn of the book to be borrowed
     * 
     * example usage: cork_city.borrow("9781472258229");
     * 
     * prints out "Book not found" if book is not present,
     * if found and available prints out "Book borrowed" 
     * and decrements available copies
     * 
     */
    borrow(isbn) {
        let parsedJson = this.getParsedJsonFromFile('bookStock.json');

        let indexOfBookInJsonArray = parsedJson.findIndex(book => book.ISBN === isbn);
        if (indexOfBookInJsonArray == -1) {
            console.log("Book not found");
        } else {
            //book is found, now to see if its available to borrow
            if (parsedJson[indexOfBookInJsonArray].Available > 0) {
                parsedJson[indexOfBookInJsonArray].Available--;
                console.log(`
                    ${parsedJson[indexOfBookInJsonArray].Title} is borrowed. 
                    Available: ${parsedJson[indexOfBookInJsonArray].Available}, 
                    Copies: ${parsedJson[indexOfBookInJsonArray].Copies}
                `);
            } else {
                console.log(`${parsedJson[indexOfBookInJsonArray].Title} is not available`);
            }
            this.updateJsonFile('bookStock.json', parsedJson);
        }
    }

    /**
     * 
     * @param {*} isbn the isbn of the book to be returned
     * 
     * example usage: cork_city.return("9781472258229");
     * 
     * prints out "Book not found" if book is not present,
     * if found and returnable prints out "Book returned" 
     * and increases available copies
     */
    return(isbn) {
        let parsedJson = this.getParsedJsonFromFile('bookStock.json');
        let indexOfBookInJsonArray = parsedJson.findIndex(book => book.ISBN === isbn);

        if (indexOfBookInJsonArray == -1) {
            console.log("Book not found");
        }
        else {
            if (
                parsedJson[indexOfBookInJsonArray].Available
                >=
                parsedJson[indexOfBookInJsonArray].Copies
            ) {
                console.log("All books are already returned. You can not return more than borrowed.")
            } else {
                parsedJson[indexOfBookInJsonArray].Available++;
                console.log(`
                    ${parsedJson[indexOfBookInJsonArray].Title} is returned to library. 
                    Available: ${parsedJson[indexOfBookInJsonArray].Available}, 
                    Copies: ${parsedJson[indexOfBookInJsonArray].Copies}
                `);
            }
            this.updateJsonFile('bookStock.json', parsedJson);
        }
    }

    /**
     * @helper function to get parsed json from file path
     * 
     * @param {*} path path to the json file to be parsed
     * 
     * @returns returns a parsed json object
     * 
     * works synchronously
     */
    getParsedJsonFromFile(path) {
        let json = fs.readFileSync(path, 'utf8');
        let parsedJson = JSON.parse(json);
        return parsedJson;
    }

    /**
     * @helper function to update json file
     * 
     * @param {*} path path to the json file to be updated
     * @param {*} json json object to be written to file
     * 
     * works synchronously
     */
    updateJsonFile(path, json) {
        var jsonStringified = JSON.stringify(json);
        fs.writeFileSync(path, jsonStringified, 'utf8');
    }
}
