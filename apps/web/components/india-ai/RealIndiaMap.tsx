'use client';

import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { MapPin, Filter, X, Building2, Tag, DollarSign, Calendar, Info } from 'lucide-react';
import Image from 'next/image';

interface City {
  id: string;
  cityName: string;
  slug: string;
  state: string;
  latitude: number;
  longitude: number;
  totalStartups: number;
  totalFunding: string;
  topSectors: string[];
  recentFundings: any[];
  keyAccelerators: string[];
  notableCompanies: string[];
}

interface Startup {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  tagline: string;
  stage: string;
  totalFundingInr: string;
  sector: string;
  foundedYear: number;
  headquartersCity: string;
}

interface RealIndiaMapProps {
  cities: City[];
  allStartups: Startup[];
}

// India GeoJSON URL (using detailed file with state boundaries)
const INDIA_GEO_JSON = "/india-map.json";

const SECTORS = [
  'All Sectors',
  'SaaS',
  'FinTech',
  'HealthTech',
  'EdTech',
  'DevTools',
  'B2B AI',
  'Enterprise AI',
  'Deep Tech',
  'Robotics',
  'GovTech',
  'AgriTech',
];

const STAGES = [
  'All Stages',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Growth',
];

const YEARS = [
  'All Years',
  '2024-2026',
  '2021-2023',
  '2018-2020',
  'Before 2018',
];

function formatCurrency(paise: string): string {
  const amount = Number(paise);
  const crores = amount / 10000000000;
  if (crores >= 1) return `₹${crores.toFixed(0)}Cr`;
  const lakhs = amount / 1000000000;
  return `₹${lakhs.toFixed(1)}L`;
}

export default function RealIndiaMap({ cities, allStartups }: RealIndiaMapProps) {
  console.log('RealIndiaMap rendering with:', { 
    citiesCount: cities?.length, 
    startupsCount: allStartups?.length 
  });
  
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [position, setPosition] = useState({ coordinates: [78.9629, 20.5937], zoom: 1 });
  
  // Filters
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [yearFilter, setYearFilter] = useState('All Years');

  // Filter startups
  const filteredStartups = useMemo(() => {
    return allStartups.filter((startup) => {
      if (sectorFilter !== 'All Sectors' && startup.sector !== sectorFilter) return false;
      if (stageFilter !== 'All Stages' && startup.stage !== stageFilter) return false;
      if (yearFilter !== 'All Years') {
        const year = startup.foundedYear;
        if (yearFilter === '2024-2026' && (year < 2024 || year > 2026)) return false;
        if (yearFilter === '2021-2023' && (year < 2021 || year > 2023)) return false;
        if (yearFilter === '2018-2020' && (year < 2018 || year > 2020)) return false;
        if (yearFilter === 'Before 2018' && year >= 2018) return false;
      }
      return true;
    });
  }, [allStartups, sectorFilter, stageFilter, yearFilter]);

  // Calculate filtered city stats
  const filteredCities = useMemo(() => {
    return cities.map((city) => {
      const cityStartups = filteredStartups.filter(
        (s) => s.headquartersCity === city.cityName
      );
      return {
        ...city,
        filteredCount: cityStartups.length,
      };
    });
  }, [cities, filteredStartups]);

  // Get max startup count for marker sizing
  const maxStartups = Math.max(...filteredCities.map((c) => c.filteredCount || c.totalStartups));

  // Calculate marker size using sqrt scaling (mathematically accurate for area-based bubbles)
  const getMarkerSize = (count: number) => {
    const minSize = 4;
    const maxSize = 16;
    // Use sqrt for area-based scaling - makes smaller cities more visible and proportionally accurate
    const normalized = Math.sqrt(count / maxStartups);
    const size = minSize + (normalized * (maxSize - minSize));
    return size;
  };

  // Get startups for selected city
  const selectedCityStartups = useMemo(() => {
    if (!selectedCity) return [];
    return filteredStartups
      .filter((s) => s.headquartersCity === selectedCity.cityName)
      .slice(0, 10);
  }, [selectedCity, filteredStartups]);

  const activeFiltersCount = [sectorFilter, stageFilter, yearFilter].filter(
    (f) => !f.startsWith('All')
  ).length;

  function handleMoveEnd(position: any) {
    setPosition(position);
  }

  return (
    <div className="relative">
      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'bg-brand text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              setSectorFilter('All Sectors');
              setStageFilter('All Stages');
              setYearFilter('All Years');
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand transition-colors"
          >
            Clear all filters
          </button>
        )}

        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-bold text-brand">{filteredStartups.length}</span> startups
        </div>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="mb-6 card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Industry Sector
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand"
            >
              {SECTORS.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Funding Stage
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand"
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Founded Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 overflow-hidden relative shadow-2xl border border-blue-900/30">
            {/* Decorative glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
            
            {/* Square container for map */}
            <div className="w-full aspect-square max-h-[600px] flex items-center justify-center">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1050,
                center: [82.8, 22.5],
              }}
              width={800}
              height={800}
              className="w-full h-auto"
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates as [number, number]}
                onMoveEnd={handleMoveEnd}
                minZoom={0.8}
                maxZoom={8}
              >
                <Geographies geography={INDIA_GEO_JSON}>
                  {({ geographies }) =>
                    geographies.map((geo, i) => (
                      <Geography
                        key={geo.rsmKey || `geo-${i}`}
                        geography={geo}
                        fill="rgba(30, 58, 138, 0.85)"
                        stroke="rgba(59, 130, 246, 0.6)"
                        strokeWidth={1.5}
                        style={{
                          default: {
                            fill: "rgba(30, 58, 138, 0.85)",
                            stroke: "rgba(59, 130, 246, 0.6)",
                            strokeWidth: 1.5,
                            outline: "none",
                          },
                          hover: {
                            fill: "rgba(37, 99, 235, 0.95)",
                            stroke: "rgba(96, 165, 250, 0.8)",
                            strokeWidth: 2,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "rgba(29, 78, 216, 1)",
                            stroke: "rgba(147, 197, 253, 1)",
                            strokeWidth: 2.5,
                            outline: "none",
                          },
                        }}
                        className="transition-all duration-200"
                      />
                    ))
                  }
                </Geographies>

                {/* City Markers */}
                {filteredCities.map((city) => {
                  const markerSize = getMarkerSize(city.filteredCount || city.totalStartups);
                  const isSelected = selectedCity?.id === city.id;
                  const isHovered = hoveredCity === city.id;

                  return (
                    <Marker
                      key={city.id}
                      coordinates={[city.longitude, city.latitude]}
                      onMouseEnter={() => setHoveredCity(city.id)}
                      onMouseLeave={() => setHoveredCity(null)}
                      onClick={() => setSelectedCity(city)}
                    >
                      <g style={{ cursor: 'pointer' }}>
                      {/* Outer glow for selected/hovered */}
                      {(isSelected || isHovered) && (
                        <>
                          <circle
                            r={markerSize + 12}
                            fill="rgba(59, 130, 246, 0.2)"
                            className="animate-ping"
                          />
                          <circle
                            r={markerSize + 8}
                            fill="rgba(96, 165, 250, 0.3)"
                          />
                        </>
                      )}

                      {/* City Dot with gradient effect */}
                      <circle
                        r={markerSize + 2}
                        fill="rgba(0, 0, 0, 0.3)"
                        transform="translate(1, 1)"
                      />
                      <circle
                        r={markerSize}
                        fill={isSelected ? '#60a5fa' : isHovered ? '#93c5fd' : '#3b82f6'}
                        stroke="white"
                        strokeWidth={isSelected || isHovered ? 3 : 2.5}
                        className="transition-all duration-200"
                        style={{
                          filter: isSelected || isHovered 
                            ? 'drop-shadow(0 6px 12px rgba(59, 130, 246, 0.8))' 
                            : 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))',
                        }}
                      />

                      {/* Inner highlight */}
                      <circle
                        r={markerSize * 0.4}
                        fill="rgba(255, 255, 255, 0.4)"
                        transform={`translate(-${markerSize * 0.2}, -${markerSize * 0.2})`}
                      />

                      {/* City Label with better visibility */}
                      <text
                        textAnchor="middle"
                        y={markerSize + 18}
                        className="text-xs font-bold fill-white pointer-events-none"
                        style={{ 
                          fontSize: isSelected || isHovered ? '13px' : '12px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                        }}
                      >
                        {city.cityName}
                      </text>

                      {/* Startup Count with background */}
                      <text
                        textAnchor="middle"
                        y={markerSize + 33}
                        className="text-xs fill-cyan-300 pointer-events-none font-extrabold"
                        style={{ 
                          fontSize: isSelected || isHovered ? '12px' : '11px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {city.filteredCount || city.totalStartups} startups
                      </text>
                      </g>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
            </div>

            {/* Map Controls Info */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Small Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500" />
                  <span>Major Hub</span>
                </div>
              </div>
              <span className="text-gray-500 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" />
                Scroll to zoom • Drag to pan
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar - Same as before */}
        <div className="lg:col-span-1">
          {selectedCity ? (
            <div className="card p-6 sticky top-6 animate-in fade-in slide-in-from-right duration-300">
              <button
                onClick={() => setSelectedCity(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-brand" />
                  <h3 className="font-sora font-bold text-xl text-navy dark:text-white">
                    {selectedCity.cityName}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCity.state}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-brand mb-1">
                    {selectedCityStartups.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Startups</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {formatCurrency(selectedCity.totalFunding)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Funding</div>
                </div>
              </div>

              {selectedCity.topSectors && selectedCity.topSectors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Top Sectors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCity.topSectors.slice(0, 4).map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Top Startups
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedCityStartups.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No startups match the current filters
                    </p>
                  ) : (
                    selectedCityStartups.map((startup) => (
                      <a
                        key={startup.id}
                        href={`/startups/${startup.slug}`}
                        className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            {startup.logoUrl ? (
                              <Image
                                src={startup.logoUrl}
                                alt={startup.name}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">
                              {startup.name}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                              {startup.tagline}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                {startup.stage}
                              </span>
                              {Number(startup.totalFundingInr) > 0 && (
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                                  {formatCurrency(startup.totalFundingInr)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              <a
                href={`/india-ai/cities/${selectedCity.slug}`}
                className="block mt-4 text-center text-sm text-brand font-semibold hover:underline flex items-center justify-center gap-2"
              >
                View Full Ecosystem
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="card p-12 text-center sticky top-6">
              <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg text-gray-700 dark:text-gray-300 mb-2">
                Select a City
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click on any city marker to explore its AI startup ecosystem
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                Scroll to zoom • Drag to pan the map
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
