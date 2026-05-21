import { exp } from "firebase/firestore/pipelines";
import { useState } from "react"; 
const mockBooks = [
    { id: 1, title: "Buy groceries", price: 10.78 },
    { id: 2, title: "Walk the dog", price: 5.99 },
    { id: 3, title: "Read a book", price: 15.99 },
    { id: 4, title: "Write a blog post", price: 20.00 }
];
function Books() {
    const [books, setBooks] = useState(mockBooks);
    return(
        <div>
            {books.map((book) =>(
                <div key={book.id}>
                    <h2>{book.title}</h2>
                    <p>Price: ${book.price}</p>
                </div>
            ))}
        </div>
    );
}
export default Books