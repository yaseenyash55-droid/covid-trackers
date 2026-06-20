import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://disease.sh/v3/covid-19/countries"
      );

      setCountries(response.data);
      setFilteredCountries(response.data);
    } catch (error) {
      console.log("Error fetching data");
    }
  };

  useEffect(() => {
    const result = countries.filter((country) =>
      country.country.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredCountries(result);
  }, [search, countries]);

  return (
    <div className="container">
      <h1>🌍 COVID-19 Health Stats Tracker</h1>

      <input
        type="text"
        placeholder="Search Country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <div className="card-container">
        {filteredCountries.map((country) => (
          <div className="card" key={country.countryInfo._id}>
            <img
              src={country.countryInfo.flag}
              alt={country.country}
              className="flag"
            />

            <h2>{country.country}</h2>

            <p>
              <strong>Cases:</strong>{" "}
              {country.cases.toLocaleString()}
            </p>
            
            <p>
              <strong>Recovered:</strong>{" "}
              {country.recovered.toLocaleString()}
            </p>

            <p>
              <strong>Deaths:</strong>{" "}
              {country.deaths.toLocaleString()}
            </p>

            <p>
              <strong>Active:</strong>{" "}
              {country.active.toLocaleString()}
            </p>

            {country.active > 1000000 ? (
              <div className="alert">
                ⚠ High Risk Country
              </div>
            ) : (
              <div className="safe">
                ✅ Low Risk
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;