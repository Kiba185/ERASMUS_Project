import { useState } from "react";
const mockBooks = [
  { id: 1, title: "Buy groceries", price: 1000 },
  { id: 2, title: "Walk the dog", price: 1000},
  { id: 3, title: "Read a book", price: 1000 },
  {id: 4, title: "Jo", price: 10000}
];

function Books(){
    const [books, setBooks] = useState(mockBooks)
    return <div>
        <ul>
        {books.map(book => (
          <li key={book.id}>{book.title}: {book.price}</li>
        ))}
      </ul>

    </div>
}
export default Books;