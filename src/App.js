import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("cases");
  const [darkMode, setDarkMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const countriesRes = await axios.get(
        "https://disease.sh/v3/covid-19/countries"
      );

      const globalRes = await axios.get(
        "https://disease.sh/v3/covid-19/all"
      );

      const historyRes = await axios.get(
        "https://disease.sh/v3/covid-19/historical/all?lastdays=30"
      );

      setCountries(countriesRes.data);
      setFilteredCountries(countriesRes.data);
      setGlobalStats(globalRes.data);

      const formattedHistory = Object.keys(
        historyRes.data.cases
      ).map((date) => ({
        date,
        cases: historyRes.data.cases[date],
      }));

      setHistoricalData(formattedHistory);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let filtered = countries.filter((country) =>
      country.country
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    filtered.sort((a, b) => b[sortBy] - a[sortBy]);

    setFilteredCountries(filtered);
    setCurrentPage(1);
  }, [search, sortBy, countries]);

  const top10 = [...countries]
    .sort((a, b) => b.cases - a.cases)
    .slice(0, 10);

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;

  const currentCountries =
    filteredCountries.slice(firstIndex, lastIndex);

  const totalPages = Math.ceil(
    filteredCountries.length / recordsPerPage
  );

  return (
    <div className={darkMode ? "dark app" : "light app"}>
      <div className="header">
        <h1>🌍 COVID-19 Analytics Dashboard</h1>

        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Global Summary */}
      <div className="summary-grid">
        <div className="card">
          <h3>Total Cases</h3>
          <p>{globalStats.cases?.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Recovered</h3>
          <p>{globalStats.recovered?.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Deaths</h3>
          <p>{globalStats.deaths?.toLocaleString()}</p>
        </div>

        <div className="card">
          <h3>Active</h3>
          <p>{globalStats.active?.toLocaleString()}</p>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search Country..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
        >
          <option value="cases">
            Sort By Cases
          </option>

          <option value="deaths">
            Sort By Deaths
          </option>

          <option value="recovered">
            Sort By Recovered
          </option>
        </select>
      </div>

      {/* Top 10 Chart */}
      <div className="chart-card">
        <h2>Top 10 Affected Countries</h2>

        <ResponsiveContainer
          width="100%"
          height={400}
        >
          <BarChart data={top10}>
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="cases"
              fill="#2563eb"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Chart */}
      <div className="chart-card">
        <h2>Last 30 Days Trend</h2>

        <ResponsiveContainer
          width="100%"
          height={400}
        >
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="cases"
              stroke="#ef4444"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Country</th>
            <th>Cases</th>
            <th>Recovered</th>
            <th>Deaths</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {currentCountries.map((country) => (
            <tr key={country.country}>
              <td>{country.country}</td>

              <td>
                {country.cases.toLocaleString()}
              </td>

              <td>
                {country.recovered.toLocaleString()}
              </td>

              <td>
                {country.deaths.toLocaleString()}
              </td>

              <td>
                {country.active > 1000000 ? (
                  <span className="danger">
                    High Risk
                  </span>
                ) : (
                  <span className="safe">
                    Safe
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(currentPage - 1)
          }
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            setCurrentPage(currentPage + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;