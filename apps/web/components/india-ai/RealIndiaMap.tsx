'use client';

import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { MapPin, Filter, X, Building2, Tag, DollarSign, Calendar, Info } from 'lucide-react';
import Image from 'next/image';
import { standardizeCityName } from '@aistartupimpact/utils/src/cities';

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
  aliases?: string[];
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

const INDIA_GEO_JSON = "/india-map.json";
const INDIA_TOPO_OBJECT = "india-states-clean";

const SECTORS = [
  'All Sectors', 'SaaS', 'FinTech', 'HealthTech', 'EdTech',
  'DevTools', 'B2B AI', 'Enterprise AI', 'Deep Tech', 'Robotics', 'GovTech', 'AgriTech',
];

const STAGES = [
  'All Stages', 'Bootstrapped', 'Pre-seed', 'Seed',
  'Pre-Series A', 'Series A', 'Series B', 'Series C', 'Growth',
];

const YEARS = ['All Years', '2024-2026', '2021-2023', '2018-2020', 'Before 2018'];

function formatCurrency(paise: string): string {
  const amount = Number(paise);
  const inr = amount / 100;
  const crores = inr / 10000000;
  if (crores >= 1) return `₹${Math.round(crores).toLocaleString('en-IN')}Cr`;
  const lakhs = inr / 100000;
  if (lakhs >= 1) return `₹${Math.round(lakhs)}L`;
  return '—';
}

function matchesCity(startupCity: string | null | undefined, city: { cityName: string; aliases?: string[] }) {
  if (!startupCity) return false;
  const stdStartup = standardizeCityName(startupCity).toLowerCase();
  const stdCity = standardizeCityName(city.cityName).toLowerCase();
  if (stdStartup === stdCity) return true;
  const rawStartup = startupCity.trim().toLowerCase();
  const rawCity = city.cityName.trim().toLowerCase();
  if (rawStartup === rawCity) return true;
  if (city.aliases && Array.isArray(city.aliases)) {
    if (city.aliases.some(alias => alias.trim().toLowerCase() === rawStartup)) return true;
    if (city.aliases.some(alias => standardizeCityName(alias).toLowerCase() === stdStartup)) return true;
  }
  return false;
}

// Normalize state names for matching between TopoJSON (UPPERCASE) and city data (Title Case)
function normalizeStateName(name: string): string {
  return name.trim().toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ');
}

export default function RealIndiaMap({ cities, allStartups }: RealIndiaMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [position, setPosition] = useState({ coordinates: [78.9629, 20.5937], zoom: 1 });

  // Filters
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [yearFilter, setYearFilter] = useState('All Years');

  const activeFiltersCount = useMemo(() => {
    return [sectorFilter, stageFilter, yearFilter].filter(f => !f.startsWith('All')).length;
  }, [sectorFilter, stageFilter, yearFilter]);

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

  // Cities with filtered counts
  const filteredCities = useMemo(() => {
    return cities.map((city) => {
      const cityStartups = filteredStartups.filter(s => matchesCity(s.headquartersCity, city));
      return { ...city, filteredCount: cityStartups.length };
    });
  }, [cities, filteredStartups]);

  // Get max startup count for marker sizing
  const maxStartups = useMemo(() => {
    const counts = filteredCities.map(c => activeFiltersCount > 0 ? c.filteredCount : c.totalStartups);
    return Math.max(...counts, 1);
  }, [filteredCities, activeFiltersCount]);

  const getMarkerSize = (count: number) => {
    const minSize = 3;
    const maxSize = 12;
    const normalized = Math.sqrt(count / maxStartups);
    return minSize + (normalized * (maxSize - minSize));
  };

  // Get cities in selected state
  const stateCities = useMemo(() => {
    if (!selectedState) return [];
    return filteredCities.filter(c => 
      normalizeStateName(c.state) === normalizeStateName(selectedState)
    );
  }, [selectedState, filteredCities]);

  // Get startups for selected state
  const stateStartups = useMemo(() => {
    if (!selectedState) return [];
    return filteredStartups.filter(s => {
      const city = cities.find(c => matchesCity(s.headquartersCity, c));
      return city && normalizeStateName(city.state) === normalizeStateName(selectedState);
    });
  }, [selectedState, filteredStartups, cities]);

  // Get startups for selected city
  const cityStartups = useMemo(() => {
    if (!selectedCity) return [];
    return filteredStartups.filter(s => matchesCity(s.headquartersCity, selectedCity));
  }, [selectedCity, filteredStartups]);

  // What to show in sidebar
  const sidebarStartups = selectedCity ? cityStartups : stateStartups;
  const sidebarTitle = selectedCity ? selectedCity.cityName : selectedState;
  const sidebarSubtitle = selectedCity ? selectedCity.state : null;

  // States that have startups (for highlighting)
  const statesWithStartups = useMemo(() => {
    const stateSet = new Set<string>();
    cities.forEach(c => {
      if (c.state) stateSet.add(normalizeStateName(c.state));
    });
    return stateSet;
  }, [cities]);

  function handleStateClick(stateName: string) {
    const normalized = normalizeStateName(stateName);
    if (selectedState && normalizeStateName(selectedState) === normalized) {
      setSelectedState(null);
      setSelectedCity(null);
    } else {
      setSelectedState(stateName);
      setSelectedCity(null);
    }
  }

  function handleCityClick(city: City) {
    setSelectedCity(city);
    setSelectedState(city.state);
  }

  function handleMoveEnd(pos: any) {
    setPosition(pos);
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
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{activeFiltersCount}</span>
          )}
        </button>
        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setSectorFilter('All Sectors'); setStageFilter('All Stages'); setYearFilter('All Years'); }}
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
        <div className="mb-6 card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Sector
            </label>
            <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand">
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Stage
            </label>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand">
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Year
            </label>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Map + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="card p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden relative shadow-2xl border border-blue-900/30">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
            <div className="w-full aspect-square max-h-[600px] flex items-center justify-center">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 1050, center: [82.8, 22.5] }}
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
                      geographies.map((geo, i) => {
                        const stateName = geo.properties?.STNAME || geo.properties?.NAME_1 || '';
                        const isStateSelected = selectedState && normalizeStateName(stateName) === normalizeStateName(selectedState);
                        const hasStartups = statesWithStartups.has(normalizeStateName(stateName));

                        return (
                          <Geography
                            key={geo.rsmKey || `geo-${i}`}
                            geography={geo}
                            onClick={() => handleStateClick(stateName)}
                            style={{
                              default: {
                                fill: isStateSelected
                                  ? "rgba(59, 130, 246, 0.9)"
                                  : hasStartups
                                  ? "rgba(30, 58, 138, 0.85)"
                                  : "rgba(20, 40, 100, 0.6)",
                                stroke: isStateSelected
                                  ? "rgba(147, 197, 253, 1)"
                                  : "rgba(59, 130, 246, 0.5)",
                                strokeWidth: isStateSelected ? 2.5 : 1,
                                outline: "none",
                                cursor: "pointer",
                              },
                              hover: {
                                fill: isStateSelected
                                  ? "rgba(96, 165, 250, 0.95)"
                                  : "rgba(37, 99, 235, 0.9)",
                                stroke: "rgba(147, 197, 253, 0.9)",
                                strokeWidth: 2,
                                outline: "none",
                                cursor: "pointer",
                              },
                              pressed: {
                                fill: "rgba(59, 130, 246, 1)",
                                stroke: "rgba(191, 219, 254, 1)",
                                strokeWidth: 2.5,
                                outline: "none",
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* City Dots — minimal, only labels on hover/select */}
                  {filteredCities.map((city) => {
                    const count = activeFiltersCount > 0 ? city.filteredCount : city.totalStartups;
                    if (count === 0) return null;
                    const markerSize = getMarkerSize(count);
                    const isSelected = selectedCity?.id === city.id;
                    const isHovered = hoveredCity === city.id;
                    const isInSelectedState = selectedState && normalizeStateName(city.state) === normalizeStateName(selectedState);

                    return (
                      <Marker
                        key={city.id}
                        coordinates={[city.longitude, city.latitude]}
                        onMouseEnter={() => setHoveredCity(city.id)}
                        onMouseLeave={() => setHoveredCity(null)}
                        onClick={() => handleCityClick(city)}
                      >
                        <g style={{ cursor: 'pointer' }}>
                          {/* Pulse ring for selected */}
                          {isSelected && (
                            <circle r={markerSize + 10} fill="rgba(59, 130, 246, 0.15)" className="animate-ping" />
                          )}

                          {/* Dot */}
                          <circle
                            r={isSelected ? markerSize + 2 : isHovered ? markerSize + 1 : markerSize}
                            fill={isSelected ? '#60a5fa' : isHovered ? '#93c5fd' : isInSelectedState ? '#60a5fa' : '#3b82f6'}
                            stroke="white"
                            strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                            style={{
                              filter: isSelected || isHovered
                                ? 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.7))'
                                : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
                              transition: 'all 0.2s ease',
                            }}
                          />

                          {/* Label — always visible */}
                          <text
                            textAnchor="middle"
                            y={markerSize + 14}
                            style={{
                              fontSize: isSelected || isHovered ? '11px' : '10px',
                              fontWeight: 600,
                              fill: 'white',
                              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)',
                              pointerEvents: 'none',
                            }}
                          >
                            {city.cityName}
                          </text>
                          <text
                            textAnchor="middle"
                            y={markerSize + 26}
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              fill: '#67e8f9',
                              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                              pointerEvents: 'none',
                            }}
                          >
                            {count} startup{count > 1 ? 's' : ''}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-white" />
                  <span>City with startups</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 rounded bg-blue-600 border border-blue-300" />
                  <span>Selected state</span>
                </div>
              </div>
              <span className="text-gray-500 flex items-center gap-2 text-xs">
                <Info className="w-3.5 h-3.5" />
                Click state or city dot
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {(selectedState || selectedCity) ? (
            <div className="card p-6 sticky top-6">
              <button
                onClick={() => { setSelectedState(null); setSelectedCity(null); }}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-5 h-5 text-brand" />
                  <h3 className="font-sora font-bold text-xl text-navy dark:text-white">
                    {sidebarTitle}
                  </h3>
                </div>
                {sidebarSubtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{sidebarSubtitle}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {sidebarStartups.length} startup{sidebarStartups.length !== 1 ? 's' : ''}
                  {selectedState && !selectedCity && stateCities.length > 0 && (
                    <> across {stateCities.length} cit{stateCities.length > 1 ? 'ies' : 'y'}</>
                  )}
                </p>
              </div>

              {/* City pills (when state selected) */}
              {selectedState && !selectedCity && stateCities.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {stateCities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCity(c)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                    >
                      {c.cityName} ({activeFiltersCount > 0 ? c.filteredCount : c.totalStartups})
                    </button>
                  ))}
                </div>
              )}

              {/* Startups list */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {sidebarStartups.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No startups in this {selectedCity ? 'city' : 'state'} match current filters
                  </p>
                ) : (
                  sidebarStartups.slice(0, 15).map((startup) => (
                    <a
                      key={startup.id}
                      href={`/startups/${startup.slug}`}
                      className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-600">
                          {startup.logoUrl ? (
                            <Image src={startup.logoUrl} alt={startup.name} width={28} height={28} sizes="28px" className="object-contain" />
                          ) : (
                            <Building2 className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">
                            {startup.name}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {startup.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded font-medium">
                              {startup.stage.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-400">{startup.headquartersCity}</span>
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
                {sidebarStartups.length > 15 && (
                  <p className="text-xs text-center text-gray-400 pt-2">
                    +{sidebarStartups.length - 15} more startups
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-10 text-center sticky top-6">
              <MapPin className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg text-gray-700 dark:text-gray-300 mb-2">
                Explore the Map
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Click on a <strong>state</strong> to see all its startups, or click a <strong>city dot</strong> for city-level view
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                Scroll to zoom • Drag to pan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
