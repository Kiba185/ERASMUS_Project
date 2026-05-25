import { useState } from "react";
const mockBooks = [
  { id: 1, title: "Buy groceries", price: 10.99 },
  { id: 2, title: "Walk the dog", price: 5.99 },
  { id: 3, title: "Read a book", price: 15.99 },
  { id: 4, title: "Go to the gym", price: 20.00 },
];

function Books() {
    const [books, setBooks] = useState(mockBooks);
    const [inputValue, setInputValue] = useState("");
    
    const addBook = () => {
        if (inputValue.trim() === "") return;
        const newBook = {
        id: Date.now(),
        title: inputValue,
        price: 0.00,
        };
        setBooks([...books, newBook]);
        setInputValue("");
    };

    return (
        
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            {books.map((book) => (
                <div key={book.id} className="bg-slate-700 p-4 rounded-lg m-2">
                    <h2 className="text-xl font-bold">{book.title}</h2>
                    <p className="text-lg font-semibold">${book.price}</p>
                    <h1>Book List</h1>
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="New book..."
                    />
                    <button onClick={addBook}>Add</button>
                    <ul>
                        {books.map(book => (
                        <li key={book.id}>{book.title}</li>
                        ))}
                    </ul>

                </div>
            ))}
        </div>
    );

}
export default Books;
