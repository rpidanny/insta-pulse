import 'react-tabs/style/react-tabs.css'

import { CalendarDatum, ResponsiveCalendar } from '@nivo/calendar'
import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMoon, FiSun } from 'react-icons/fi'

import data from './data/processed.json'

interface Data {
  yearlyData: Record<string, CalendarDatum[]>
  updatedAt: string
}

const typedData: Data = data
const yearlyData = typedData.yearlyData
const years = Object.keys(yearlyData).map(Number)
const defaultYearIndex = years.indexOf(new Date().getFullYear()) || 0

const CalendarTabs = () => {
  const [currentYearIndex, setCurrentYearIndex] = useState(defaultYearIndex)
  const [darkMode, setDarkMode] = useState(false)

  const nivoTheme = {
    text: {
      fill: darkMode ? '#e0e0e0' : '#333333',
    },
    tooltip: {
      container: {
        background: darkMode ? '#333333' : '#ffffff',
        color: darkMode ? '#ffffff' : '#333333',
      },
    },
    monthTextColor: darkMode ? '#ffeb3b' : '#333333',
  }

  const toggleTheme = () => setDarkMode(!darkMode)
  const goToNextYear = () => setCurrentYearIndex(prev => (prev + 1) % years.length)
  const goToPrevYear = () => setCurrentYearIndex(prev => (prev - 1 + years.length) % years.length)

  const currentYear = years[currentYearIndex]
  const currentYearData = yearlyData[currentYear.toString()]
  const totalScore = useMemo(
    () => currentYearData.reduce((sum, item) => sum + (item.value || 0), 0),
    [currentYearData],
  )

  return (
    <div
      className={classNames(
        'min-h-screen p-5 flex flex-col items-center justify-center transition-colors duration-300',
        {
          'bg-gray-900 text-white': darkMode,
          'bg-gray-50 text-gray-900': !darkMode,
        },
      )}
    >
      <div className="absolute top-5 right-5 flex items-center space-x-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={darkMode}
            onChange={toggleTheme}
          />
          <div
            className={classNames(
              'w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300',
              {
                'peer-checked:bg-gray-700': darkMode,
              },
            )}
          ></div>
          <span
            className={classNames(
              'absolute inset-y-0 left-0 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-md transform transition',
              {
                'translate-x-5': darkMode,
              },
            )}
          >
            {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
          </span>
        </label>
      </div>

      <p>
        <span
          className={classNames('font-bold', {
            'text-green-400': totalScore < 60,
            'text-yellow-400': totalScore >= 60 && totalScore < 120,
            'text-red-400': totalScore >= 120,
          })}
        >
          {totalScore}
        </span>{' '}
        Day(s) Active in {currentYear}
      </p>

      <div className="w-full h-[60vh] max-w-7xl mb-8">
        <ResponsiveCalendar
          data={currentYearData}
          from={`${years[currentYearIndex]}-01-01`}
          to={`${years[currentYearIndex]}-12-31`}
          emptyColor={darkMode ? '#17243e' : '#eeeeee'}
          colors={
            // start to green and then go towards red
            darkMode
              ? ['#90be6d', '#ffeb3b', '#ff6361']
              : ['#d8f3dc', '#90be6d', '#f9c74f', '#ff6361']
          }
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          yearSpacing={40}
          monthBorderColor={darkMode ? '#101827' : '#ffffff'}
          dayBorderWidth={2}
          dayBorderColor={darkMode ? '#101827' : '#ffffff'}
          theme={nivoTheme}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'row',
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: 'right-to-left',
            },
          ]}
        />
      </div>

      <div className="w-full flex items-center justify-center space-x-6 mb-6">
        <button
          onClick={goToPrevYear}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition"
        >
          <FiChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-medium">{years[currentYearIndex]}</h2>
        <button
          onClick={goToNextYear}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-700 transition"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      <p
        className={classNames('absolute bottom-5 text-sm text-center w-full', {
          'text-gray-400': darkMode,
          'text-gray-500': !darkMode,
        })}
      >
        Updated at {new Date(typedData.updatedAt).toLocaleString('en-US')}
      </p>
    </div>
  )
}

export default CalendarTabs
