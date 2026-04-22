import { useState } from 'react';

export const useSorting = (defaultField = 'id', defaultDirection = 'asc') => {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDirection, setSortDirection] = useState(defaultDirection);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortData = (data) => {
    return [...data].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    sortData,
    getSortIndicator
  };
};