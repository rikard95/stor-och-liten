import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "./App.css";

interface IItem {
  displayLink: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  htmlSnippet: string;
  htmlTitle: string;
  kind: string;
  link: string;
  snippet: string;
  pagemap: {
    cse_thumbnail?: IItemThumbnail[];
    cse_image?: IItemThumbnail[];
  };
  title: string;
}

interface IItemThumbnail {
  height: string;
  src: string;
  width: string;
}

interface IApiResponse {
  items: IItem[];
  searchInformation: {
    totalResults: string;
  };
}

function App() {
  const [searchText, setSearchText] = useState<string>("");
  const [items, setItems] = useState<IItem[] | null>(null);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalResults, setTotalResults] = useState<number>(0);

  const fetchResults = async () => {
    if (searchText.length <= 2) {
      setError("Must type more than 2 characters");
      return;
    }

    try {
      const response = await axios.get<IApiResponse>(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            q: searchText,
            key: import.meta.env.VITE_KEY,
            cx: import.meta.env.VITE_CX,
            siteSearch: "storochliten.se/",
            start: (page - 1) * 10 + 1,
          },
        }
      );
      console.log("API Response:", response.data);
      if (!response.data.items) {
        throw new Error("No search results");
      }

      setItems(response.data.items);
      setTotalResults(
        parseInt(response.data.searchInformation.totalResults, 10)
      );
      setError("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchResults();
  };

  useEffect(() => {
    if (searchText.length > 3) {
      fetchResults();
    }
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      <h2 className="header">Lego från Stor&Liten</h2>

      <section className="search-form">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Sök produkter..."
            className="search-input"
            value={searchText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchText(e.target.value);
            }}
          />
          <button className="search-button" type="submit">
            Sök
          </button>
        </form>
      </section>

      <section className="results">
        {error && <p style={{ color: "red" }}>{error}</p>}
        {items &&
          items.map((item) => {
            const imageSrc =
              item.pagemap.cse_image?.[0]?.src ||
              item.pagemap.cse_thumbnail?.[0]?.src ||
              "https://tacm.com/wp-content/uploads/2018/01/no-image-available.jpeg";

            return (
              <div key={item.link} className="result-card">
                <section className="result-image">
                  <img
                    src={imageSrc}
                    alt={item.title}
                    className="result-image"
                  />
                </section>
                <section className="content">
                  <h3>{item.title}</h3>
                  <p>{item.snippet}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Till produkten &rarr;
                  </a>
                </section>
              </div>
            );
          })}
      </section>

      {items && (
        <section className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(Math.max(page - 1, 1))}
            disabled={page === 1}
          >
            Föregående
          </button>
          <span className="page-number">
            Sida {page} av {Math.ceil(totalResults / 10)}
          </span>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page * 10 >= totalResults}
          >
            Nästa
          </button>
        </section>
      )}
    </div>
  );
}

export default App;
