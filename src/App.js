import { useEffect, useRef, useState } from "react";
import StartRating from "./StartRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0).toFixed(1);

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return;
      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);
    return () => document.removeEventListener("keydown", callback);
  }, [setQuery]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function MovieList({ movies, onSeleteMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSeleteMovie={onSeleteMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSeleteMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onSeleteMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function SeletedMovie({ seletedId, onClose, onAddMovie, watched }) {
  const [movie, setMovies] = useState({});
  const [isLoading, setIsloading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.map((movie) => movie.imdbID).includes(seletedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === seletedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: dircetor,
    Genre: genre,
  } = movie;
  useEffect(() => {
    async function getMovieDetail() {
      setIsloading(true);
      const response = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${seletedId}`
      );
      const data = await response.json();
      setMovies(data);
      setIsloading(false);
    }
    getMovieDetail();
  }, [seletedId]);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: seletedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: runtime.split("").at(0),
      userRating,
    };
    onAddMovie(newWatchedMovie);
    onClose();
  }

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return (
    <div className="details">
      {isLoading ? (
        <p className="loader">Loading ...</p>
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onClose}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of the ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}{" "}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐ </span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {" "}
              {!isWatched ? (
                <>
                  <StartRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {dircetor}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummery({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}

const KEY = "e25cc5";
export default function App() {
  const [movies, setMovies] = useState([]);

  const [query, setQuery] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [seletedId, setSeleteId] = useState(null);

  const [watched, setWatched] = useState(() => {
    const store = JSON.parse(localStorage.getItem("watched")) || [];
    return store;
  });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    async function fectMovie() {
      try {
        setIsloading(true);
        setError("");
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&S=${query}`,
          { signal }
        );
        if (!response.ok)
          throw new Error("Something went wrong with fetching movies");

        const data = await response.json();
        console.log(data);
        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search);
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        setIsloading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    fectMovie();

    return () => abortController.abort();
  }, [query]);

  function handleMovie(id) {
    return setSeleteId((prvId) => (prvId === id ? null : id));
  }
  function handleClose() {
    return setSeleteId(null);
  }
  function handleWatched(movie) {
    const updatedWatched = [...watched, movie];
    setWatched(updatedWatched);
    localStorage.setItem("watched", JSON.stringify(updatedWatched));
  }

  function handleDelete(id) {
    const updatedWatched = watched.filter((movie) => movie.imdbID !== id);
    setWatched(updatedWatched);
    localStorage.setItem("watched", JSON.stringify(updatedWatched));
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <p className="loader">Loading...</p>}
          {error ? (
            <p className="error">{error}</p>
          ) : (
            <MovieList movies={movies} onSeleteMovie={handleMovie} />
          )}
        </Box>
        <Box>
          {seletedId ? (
            <SeletedMovie
              seletedId={seletedId}
              onClose={handleClose}
              onAddMovie={handleWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummery watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDelete}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
