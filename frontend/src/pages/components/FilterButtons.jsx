import React from 'react';

function FilterButtons({ filters, onChange }) {
  // Example categories for filtering
  const categories = ['Fruit', 'Vegetable'];
  const colors = ['Red', 'Yellow', 'Orange', 'Green'];

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    onChange(newFilters);
  };

  return (
    <div>
      <div>
        <p>Category:</p>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleFilterChange('category', category)}
          >
            {category}
          </button>
        ))}
        <button onClick={() => handleFilterChange('category', '')}>Reset</button>
      </div>
      <div>
        <p>Color:</p>
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleFilterChange('color', color)}
          >
            {color}
          </button>
        ))}
        <button onClick={() => handleFilterChange('color', '')}>Reset</button>
      </div>
    </div>
  );
}


export default FilterButtons;