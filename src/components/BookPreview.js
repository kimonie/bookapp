import { useEffect, useState } from 'react';
import '../App.css';

export default function BookPreview() {
  const [text, setText] = useState('');

  useEffect(() => {
    fetch('../books/books.txt')
      .then((res) => res.text())
      .then((data) => setText(data))
      .catch(() => setText('Failed to load book content.'));
  }, []);

  return (
    <div className="App book-preview">
      <h2>📖 Private Book Preview</h2>
      <div className="book-box">
        <div className="book-content">{text}</div>
      </div>
    </div>
  );
}

