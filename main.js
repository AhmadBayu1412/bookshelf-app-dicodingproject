// Inisialisasi global variabel
const byId = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

const submitForm = byId('bookForm');

const bookFormTitle = byId('bookFormTitle');
const bookFormAuthor = byId('bookFormAuthor');
const bookFormYear = byId('bookFormYear');
const bookFormIsComplete = byId('bookFormIsComplete');
const bookFormSubmit = byId('bookFormSubmit');
const bookFormImage = byId('bookFormImage');
const imagePreview = byId('imagePreview');

/* ====================================================================
   APP STATE
==================================================================== */
let editingBookId = null;
let pendingImageB64 = null; // base64 string dari gambar yang baru dipilih
const books = [];
const RENDER_EVENT = 'render-book';

/* ====================================================================
   Initialization
==================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  loadFromStorage();

  submitForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
  });

  // Preview gambar saat user memilih file
  bookFormImage.addEventListener('change', function () {
    const file = bookFormImage.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      pendingImageB64 = e.target.result; // simpan base64 sementara
      showImagePreview(pendingImageB64);
    };
    reader.readAsDataURL(file);
  });
});

/* ====================================================================
   IMAGE PREVIEW HELPER
==================================================================== */
/**
 * Tampilkan preview gambar di kotak preview form.
 * @param {string|null} src - base64 data URL atau null untuk reset
 */
function showImagePreview(src) {
  if (src) {
    imagePreview.innerHTML = `<img src="${src}" alt="preview sampul buku" />`;
  } else {
    imagePreview.innerHTML = `
      <div class="image-placeholder">
        <i class="ti ti-photo"></i>
        <span>Belum ada gambar dipilih</span>
      </div>`;
  }
}

/* ====================================================================
   Book Card
==================================================================== */
function addBook() {
  if (!bookFormTitle.value.trim() || !bookFormAuthor.value.trim()) {
    alert('Judul dan penulis buku wajib diisi!');
    return;
  }

  /* ===================== Mode edit ===================== */
  if (editingBookId !== null) {
    const book = books.find((b) => b.id === editingBookId);
    if (!book) return;

    book.title = bookFormTitle.value;
    book.author = bookFormAuthor.value;
    book.year = Number(bookFormYear.value); // pastikan number
    book.isComplete = bookFormIsComplete.checked;
    book.status = bookFormIsComplete.checked;

    // Hanya update gambar kalau user memilih gambar baru
    if (pendingImageB64) {
      book.image = pendingImageB64;
    }

    editingBookId = null;
    pendingImageB64 = null;

    bookFormSubmit.textContent = 'Masukkan Buku ke rak';

    /* ===================== Mode tambah ===================== */
  } else {
    const ID_buku = generateId();
    const bookObject = generateBookObject(
      ID_buku,
      bookFormTitle.value,
      bookFormAuthor.value,
      Number(bookFormYear.value), // konversi ke number
      bookFormIsComplete.checked,
      pendingImageB64, // bisa null kalau tidak pilih gambar
    );
    books.push(bookObject);
    pendingImageB64 = null;
  }

  // Reset form & preview
  submitForm.reset();
  showImagePreview(null);

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
  return +new Date();
}

/**
 * @param {number}      id
 * @param {string}      title
 * @param {string}      author
 * @param {number}      year     - tipe number
 * @param {boolean}     status   - true = sudah selesai dibaca
 * @param {string|null} image    - base64 data URL atau null
 */
function generateBookObject(id, title, author, year, status, image = null) {
  return {
    id,
    title,
    author,
    year, // number
    isComplete: status, // properti utama sesuai ketentuan
    status, // alias untuk kompatibilitas render
    image, // base64 atau null
  };
}

// Listen for the render event
document.addEventListener(RENDER_EVENT, function () {
  renderBook();
});

// =============================================================================
// CARD RENDERING
// =============================================================================

const incompleteContainer = qs('[data-testid="incompleteBookList"]');
const completeContainer = qs('[data-testid="completeBookList"]');

/**
 * Buat markup HTML satu kartu buku.
 * Gambar ditampilkan dari base64 (lokal user). Jika tidak ada, tampilkan
 * placeholder dengan inisial judul buku.
 */
function createBookSection(book) {
  // --- Bagian gambar ---
  let imgMarkup = '';
  if (book.image) {
    imgMarkup = `
      <div class="book-cover">
        <img src="${book.image}" alt="Sampul ${book.title}" />
      </div>`;
  } else {
    // Placeholder: inisial huruf pertama judul
    const initial = book.title.trim().charAt(0).toUpperCase();
    imgMarkup = `
      <div class="book-cover book-cover--placeholder">
        <span class="book-initial">${initial}</span>
      </div>`;
  }

  // --- Tombol status ---
  let checkMarkup = '';
  if (book.status === true) {
    checkMarkup = `
      <div class="book-completed done">
        <span><i class="ti ti-check"></i></span>
        <button class="undo-btn" data-testid="bookItemIsCompleteButton">Belum selesai dibaca</button>
      </div>`;
  } else {
    checkMarkup = `
      <div class="book-completed">
        <span><i class="ti ti-check"></i></span>
        <button class="complete-btn" data-testid="bookItemIsCompleteButton">Selesai dibaca</button>
      </div>`;
  }

  return `
    <div class="bookItem" data-bookid="${book.id}" data-testid="bookItem">
      ${imgMarkup}
      <div class="bookItem-description">
        <h3 data-testid="bookItemTitle">${book.title}</h3>
        <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
        <div class="icon-calendar">
          <i class="ti ti-calendar-week"></i>
          <p data-testid="bookItemYear">Tahun: ${book.year}</p>
        </div>
      </div>
      <div class="book-status">
        ${checkMarkup}
        <div class="book-delete">
          <span><i class="ti ti-trash"></i></span>
          <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        </div>
        <div class="book-edit">
          <span><i class="ti ti-pencil"></i></span>
          <button data-testid="bookItemEditButton">Edit Buku</button>
        </div>
      </div>
    </div>`;
}

function renderBook() {
  completeContainer.innerHTML = '';
  incompleteContainer.innerHTML = '';

  books.forEach((book) => {
    const cardHTML = createBookSection(book);
    if (book.status === true) {
      completeContainer.innerHTML += cardHTML;
    } else {
      incompleteContainer.innerHTML += cardHTML;
    }
  });
}

// =============================================================================
// EVENT DELEGATION
// =============================================================================

document.addEventListener('click', function (e) {
  if (e.target.closest('.complete-btn')) {
    const bookId = Number(e.target.closest('.bookItem').dataset.bookid);
    moveBook(bookId);
  } else if (e.target.closest('.undo-btn')) {
    const bookId = Number(e.target.closest('.bookItem').dataset.bookid);
    moveBook(bookId);
  } else if (e.target.closest('[data-testid="bookItemDeleteButton"]')) {
    const bookId = Number(e.target.closest('.bookItem').dataset.bookid);
    deleteBook(bookId);
  } else if (e.target.closest('[data-testid="bookItemEditButton"]')) {
    const bookId = Number(e.target.closest('.bookItem').dataset.bookid);
    editBook(bookId);
  }
});

// =============================================================================
// TASK MOVEMENT
// =============================================================================

function moveBook(id) {
  const book = books.find((t) => t.id === id);
  if (!book) return;

  book.status = !book.status;

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBook(id) {
  const bookIndex = books.findIndex((t) => t.id === id);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBook(id) {
  const book = books.find((b) => b.id === id);
  if (!book) return;

  // Isi form dengan data buku
  bookFormTitle.value = book.title;
  bookFormAuthor.value = book.author;
  bookFormYear.value = book.year;
  bookFormIsComplete.checked = book.status;

  // Tampilkan gambar yang sudah ada (jika ada)
  showImagePreview(book.image || null);
  pendingImageB64 = null; // reset; gambar lama tetap dipakai kalau tidak diganti

  editingBookId = id;
  bookFormSubmit.textContent = 'Simpan Perubahan';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  bookFormTitle.focus();
}

// =============================================================================
// PERSISTENCE — localStorage
// =============================================================================
const STORAGE_KEY = 'BOOKFLOW_APPS';
const SAVED_EVENT = 'saved_book';

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  document.dispatchEvent(new Event(SAVED_EVENT));
}

function loadFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (!serializedData) return;

  const data = JSON.parse(serializedData);
  books.length = 0;
  for (const book of data) {
    books.push(book);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

/* ====================================================================
   SEARCH
==================================================================== */
const searchForm = byId('searchBook');
const searchInput = byId('searchBookTitle');

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  searchBook();
});

function searchBook() {
  const keyword = searchInput.value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(keyword),
  );
  renderFilteredBooks(filteredBooks);
}

function renderFilteredBooks(filteredBooks) {
  completeContainer.innerHTML = '';
  incompleteContainer.innerHTML = '';

  filteredBooks.forEach((book) => {
    const cardHTML = createBookSection(book);
    if (book.status === true) {
      completeContainer.innerHTML += cardHTML;
    } else {
      incompleteContainer.innerHTML += cardHTML;
    }
  });
}
