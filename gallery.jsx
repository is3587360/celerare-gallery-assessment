import { useCallback, useMemo, useReducer, useState } from 'react';
import useFetchPhotos from '../hooks/usefetchphotos';

function favoritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const next = new Set(state);

      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }

      localStorage.setItem('celebrare-favorites', JSON.stringify([...next]));
      return next;
    }

    default:
      return state;
  }
}

function getInitialFavorites() {
  try {
    return new Set(
      JSON.parse(localStorage.getItem('celebrare-favorites') || '[]')
    );
  } catch {
    return new Set();
  }
}

function Gallery() {
  const { photos, loading, error } = useFetchPhotos();
  const [search, setSearch] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const [favorites, dispatch] = useReducer(
    favoritesReducer,
    undefined,
    getInitialFavorites
  );

  const handleSearch = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesAuthor = photo.author
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesFavorite = !showFavorites || favorites.has(photo.id);

      return matchesAuthor && matchesFavorite;
    });
  }, [photos, search, showFavorites, favorites]);

  const toggleFavorite = (id) => {
    dispatch({ type: 'TOGGLE', id });
  };

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Celebrare Photo Gallery
      </h1>

      <div className="mx-auto mb-8 flex max-w-3xl flex-col gap-4 sm:flex-row">
        <input
          type="search"
          placeholder="Search photos by author..."
          value={search}
          onChange={handleSearch}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          aria-label="Search photos by author"
        />

        <button
          type="button"
          onClick={() => setShowFavorites((current) => !current)}
          aria-pressed={showFavorites}
          className={`rounded-lg px-5 py-3 font-medium whitespace-nowrap ${
            showFavorites
              ? 'bg-pink-600 text-white'
              : 'bg-white text-gray-700 shadow'
          }`}
        >
          {showFavorites ? '❤️ All Photos' : '♡ Favourites'}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
            role="status"
            aria-label="Loading photos"
          />
        </div>
      )}

      {error && (
        <p className="py-8 text-center text-red-600">
          Could not load photos: {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <p className="mb-5 text-center text-sm text-gray-600">
            {filteredPhotos.length} photos found
          </p>

          {filteredPhotos.length === 0 ? (
            <p className="py-12 text-center text-gray-600">
              No photos found. Try another author name.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredPhotos.map((photo) => {
                const isFavorite = favorites.has(photo.id);

                return (
                  <article
                    key={photo.id}
                    className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-lg"
                  >
                    <img
                      src={photo.download_url}
                      alt={`Photo by ${photo.author}`}
                      className="h-56 w-full object-cover"
                      loading="lazy"
                    />

                    <div className="flex items-center justify-between gap-3 p-4">
                      <p className="font-medium text-gray-800">
                        {photo.author}
                      </p>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(photo.id)}
                        aria-label={
                          isFavorite
                            ? `Remove ${photo.author} from favourites`
                            : `Add ${photo.author} to favourites`
                        }
                        aria-pressed={isFavorite}
                        className={`text-2xl ${
                          isFavorite ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        {isFavorite ? '❤️' : '♡'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Gallery;
