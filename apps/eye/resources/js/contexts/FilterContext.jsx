import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [currentFilter, setCurrentFilter] = useState({
    view_period: 'daily',
    date: null,
    page: 'patients-to-return'
  });

  const updateFilter = (filter) => {
    setCurrentFilter(prev => ({
      ...prev,
      ...filter
    }));
  };

  return (
    <FilterContext.Provider value={{ currentFilter, updateFilter }}>
      {children}
    </FilterContext.Provider>
  );
};
