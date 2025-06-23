import React from 'react'
import SearchForm from '@/components/SearchForm'
import { ChartsContainer } from '@/components/charts'
import { SunriseDataTable } from '@/components/DataTable'
import { useSearchWithApi } from '@/hooks/useApi'

function App() {
  const searchState = useSearchWithApi()
  const { data, loading, hasSearched, hasData } = searchState

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">

        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gradient-sunrise mb-4">
            Sunrise Sunset Tracker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover sunrise and sunset times, golden hour moments, and solar data
            for any location around the world.
          </p>
        </header>

        <main className="max-w-7xl mx-auto space-y-8">

          <SearchForm searchState={searchState} />

          {hasData && (
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Solar Data for {data.location}
                </h2>
                <p className="text-gray-600">
                  Showing {data.totalDays} days from {data.dateRange?.start} to {data.dateRange?.end}
                </p>
              </div>

              {/* Interactive Charts Section */}
              <ChartsContainer data={data} />

              {/* Detailed Data Table Section */}
              <SunriseDataTable data={data} />
            </section>
          )}

          {!hasSearched && !loading && (
            <section className="text-center py-16">
              <div className="max-w-md mx-auto">
                {/* Visual focal point with gradient matching our theme */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-sunrise-500 to-sunset-500 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Ready to Explore Solar Data
                </h3>

                <p className="text-gray-600 mb-6">
                  Enter a location and date range above to discover sunrise times, sunset times,
                  golden hour periods, and comprehensive solar information for any place on Earth.
                </p>

                {/* Feature preview cards - Shows what users can expect */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Interactive Charts</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Detailed Tables</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Golden Hour Times</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

      </div>
    </div>
  )
}

export default App