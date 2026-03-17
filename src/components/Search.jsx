import { useState, useEffect, useRef } from 'react';

const Search = ({ onMicrobeSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allMicrobes, setAllMicrobes] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchAllMicrobes = async () => {
      try {
        const response = await fetch('/api/microbes');
        if (response.ok) {
          const data = await response.json();
          setAllMicrobes(data);
        } else {
          console.error('Failed to fetch all microbes:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch all microbes:', error);
      }
    };

    fetchAllMicrobes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value) {
      const filteredMicrobes = allMicrobes.filter(microbe =>
        microbe.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filteredMicrobes);
    } else {
      setResults([]);
    }
  };

  const handleSelectMicrobe = (microbe) => {
    onMicrobeSelect(microbe);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a microbe..."
        className="w-full px-4 py-2 text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
          {results.map(microbe => (
            <li
              key={microbe.name}
              className="px-4 py-2 hover:bg-slate-700 cursor-pointer"
              onClick={() => handleSelectMicrobe(microbe)}
            >
              {microbe.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
