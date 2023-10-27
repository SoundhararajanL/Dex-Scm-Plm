import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faDatabase } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import './App.css';

class GripperList extends Component {
  state = {
    filtersApplied: false,
    grippers: [],
    selectedGripper: null,
    filterOptions: {
      manufactureNames: [],
      types: [],
      categories: [],
    },
    selectedFilters: {
      manufactureName: '',
      type: '',
      category: '',
      dimensionMin: '', // No initial value
      dimensionMax: '', // No initial value
      payloadMin: '', // No initial value
      payloadMax: '', // No initial value
      forceMin: '', // No initial value
      forceMax: '', // No initial value
      pressureMin: '', // No initial value
      pressureMax: '', // No initial value
    },
    minMaxValues: {}, // Initialize minMaxValues as an empty object
    filteredGrippers: [],
  };

  componentDidMount() {
    // Fetch gripper data from the server
    axios.get('http://localhost:3000/api/grippers')
      .then((response) => {
        const grippers = response.data;
        const manufactureNames = [...new Set(grippers.map((gripper) => gripper.Data.find((data) => data.Property === 'ManufactureName').Value).filter(Boolean))];
        const types = [...new Set(grippers.map((gripper) => gripper.Data.find((data) => data.Property === 'Type').Value).filter(Boolean))];
        const categories = [...new Set(grippers.map((gripper) => gripper.Data.find((data) => data.Property === 'Category').Value).filter(Boolean))];

        // Fetch minimum and maximum values for numeric filters
        axios.get('http://localhost:3000/api/grippers/minmax')
          .then((minMaxResponse) => {
            const minMaxValues = minMaxResponse.data;

            // Set the initial state of selectedFilters after fetching minMaxValues
            this.setState({
              grippers,
              filterOptions: {
                manufactureNames,
                types,
                categories,
              },
              selectedFilters: {
                manufactureName: '',
                type: '',
                category: '',
                dimensionMin: minMaxValues.dimensionMin,
                dimensionMax: minMaxValues.dimensionMax,
                payloadMin: minMaxValues.payloadMin,
                payloadMax: minMaxValues.payloadMax,
                forceMin: minMaxValues.forceMin,
                forceMax: minMaxValues.forceMax,
                pressureMin: minMaxValues.pressureMin,
                pressureMax: minMaxValues.pressureMax,
              },
              minMaxValues,
              filteredGrippers: grippers,
            });
          })
          .catch((minMaxError) => {
            console.error('Error fetching min and max values:', minMaxError);
          });
      })
      .catch((error) => {
        console.error('Error fetching grippers:', error);
      });
  }



  handleFilterChange = (filterName, value) => {
    this.setState((prevState) => ({
      selectedFilters: {
        ...prevState.selectedFilters,
        [filterName]: value,
      },
    }));
  };

  filterGrippers = () => {

    const { grippers, selectedFilters, minMaxValues } = this.state;
    // Validate and set minimum and maximum values for filters
    const validateFilterValue = (filterName, value) => {
      const minValue = minMaxValues[`${filterName}Min`];
      const maxValue = minMaxValues[`${filterName}Max`];
      if (!isNaN(value) && (value < minValue || value > maxValue)) {
        alert(`Invalid ${filterName} value. Please enter a value between ${minValue} and ${maxValue}.`);
        return null;
      }
      return value;
    };

    // Validate and set minimum and maximum values for each filter
    const dimensionMin = validateFilterValue('dimension', selectedFilters.dimensionMin);
    const dimensionMax = validateFilterValue('dimension', selectedFilters.dimensionMax);
    const payloadMin = validateFilterValue('payload', selectedFilters.payloadMin);
    const payloadMax = validateFilterValue('payload', selectedFilters.payloadMax);
    const forceMin = validateFilterValue('force', selectedFilters.forceMin);
    const forceMax = validateFilterValue('force', selectedFilters.forceMax);
    const pressureMin = validateFilterValue('pressure', selectedFilters.pressureMin);
    const pressureMax = validateFilterValue('pressure', selectedFilters.pressureMax);


    const filteredGrippers = grippers.filter((gripper) => {
      const manufactureName = gripper.Data.find((data) => data.Property === 'ManufactureName').Value;
      const type = gripper.Data.find((data) => data.Property === 'Type').Value;
      const category = gripper.Data.find((data) => data.Property === 'Category').Value;
      const dimension = parseFloat(gripper.Data.find((data) => data.Property === 'Dimension(MM)').Value);
      const payload = parseFloat(gripper.Data.find((data) => data.Property === 'Payload(Kg)').Value);
      const force = parseFloat(gripper.Data.find((data) => data.Property === 'Gripping Force').Value);
      const pressure = parseFloat(gripper.Data.find((data) => data.Property === 'Feed pressure Max').Value);

      return (
        (selectedFilters.manufactureName === '' || manufactureName === selectedFilters.manufactureName) &&
        (selectedFilters.type === '' || type === selectedFilters.type) &&
        (selectedFilters.category === '' || category === selectedFilters.category) &&
        (isNaN(dimensionMin) || dimension >= dimensionMin) &&
        (isNaN(dimensionMax) || dimension <= dimensionMax) &&
        (isNaN(payloadMin) || payload >= payloadMin) &&
        (isNaN(payloadMax) || payload <= payloadMax) &&
        (isNaN(forceMin) || force >= forceMin) &&
        (isNaN(forceMax) || force <= forceMax) &&
        (isNaN(pressureMin) || pressure >= pressureMin) &&
        (isNaN(pressureMax) || pressure <= pressureMax)
      );
    });

    this.setState({ filteredGrippers });
    this.setState({ filtersApplied: true });
  };

  clearFilter = () => {
    this.setState((prevState) => ({
      selectedFilters: {
        manufactureName: '',
        type: '',
        category: '',
        dimensionMin: prevState.minMaxValues.dimensionMin,
        dimensionMax: prevState.minMaxValues.dimensionMax,
        payloadMin: prevState.minMaxValues.payloadMin,
        payloadMax: prevState.minMaxValues.payloadMax,
        forceMin: prevState.minMaxValues.forceMin,
        forceMax: prevState.minMaxValues.forceMax,
        pressureMin: prevState.minMaxValues.pressureMin,
        pressureMax: prevState.minMaxValues.pressureMax,
      },
    }), () => {
      this.filterGrippers();
      this.setState({ filtersApplied: false });
    });
  };


  render() {
    const { filteredGrippers, filterOptions, selectedFilters, filtersApplied } = this.state;
    const productCount = filteredGrippers.length;

    return (
      <div className="gripper-list-container">
        <div className="filter-options">
          <h2>Filters:</h2>
          <select
            value={selectedFilters.manufactureName}
            onChange={(e) => this.handleFilterChange('manufactureName', e.target.value)}
          >
            <option hidden value="">Filter by ManufactureName</option>
            {filterOptions.manufactureNames.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={selectedFilters.type}
            onChange={(e) => this.handleFilterChange('type', e.target.value)}
          >
            <option hidden value="">Filter by Type</option>
            {filterOptions.types.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={selectedFilters.category}
            onChange={(e) => this.handleFilterChange('category', e.target.value)}
          >
            <option hidden value="">Filter by Category</option>
            {filterOptions.categories.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div>
            <label>Dimension(MM) Range:</label>
            <input
              type="number"
              placeholder={`Min (${this.state.minMaxValues.dimensionMin})`}
              value={this.state.selectedFilters.dimensionMin}
              onChange={(e) => this.handleFilterChange('dimensionMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${this.state.minMaxValues.dimensionMax})`}
              value={this.state.selectedFilters.dimensionMax}
              onChange={(e) => this.handleFilterChange('dimensionMax', e.target.value)}
            />
            <div className="range-slider">
              <input
                type="range"
                min={this.state.minMaxValues.dimensionMin}
                max={this.state.minMaxValues.dimensionMax}
                value={this.state.selectedFilters.dimensionMin}
                onChange={(e) => this.handleFilterChange('dimensionMin', e.target.value)}
              />
              <input
                type="range"
                min={this.state.minMaxValues.dimensionMin}
                max={this.state.minMaxValues.dimensionMax}
                value={this.state.selectedFilters.dimensionMax}
                onChange={(e) => this.handleFilterChange('dimensionMax', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Payload(Kg) Range:</label>
            <input
              type="number"
              placeholder={`Min (${this.state.minMaxValues.payloadMin})`}
              defaultValue=""
              min={this.state.minMaxValues.payloadMin}
              max={this.state.minMaxValues.payloadMax}

              onChange={(e) => this.handleFilterChange('payloadMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${this.state.minMaxValues.payloadMax})`}
              defaultValue=""
              min={this.state.minMaxValues.payloadMin}
              max={this.state.minMaxValues.payloadMax}
              onChange={(e) => this.handleFilterChange('payloadMax', e.target.value)}
            />
          </div>
          <div>
            <label>Gripping Force Range:</label>
            <input
              type="number"
              placeholder={`Min (${this.state.minMaxValues.forceMin})`}
              defaultValue=""
              min={this.state.minMaxValues.forceMin}
              max={this.state.minMaxValues.forceMax}
              onChange={(e) => this.handleFilterChange('forceMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${this.state.minMaxValues.forceMax})`}
              defaultValue=""
              min={this.state.minMaxValues.forceMin}
              max={this.state.minMaxValues.forceMax}
              onChange={(e) => this.handleFilterChange('forceMax', e.target.value)}
            />
          </div>
          <div>
            <label>Feed pressure Max Range:</label>
            <input
              type="number"
              placeholder={`Min (${this.state.minMaxValues.pressureMin})`}
              defaultValue=""
              min={this.state.minMaxValues.pressureMin}
              max={this.state.minMaxValues.pressureMax}
              onChange={(e) => this.handleFilterChange('pressureMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${this.state.minMaxValues.pressureMax})`}
              defaultValue=""
              min={this.state.minMaxValues.pressureMin}
              max={this.state.minMaxValues.pressureMax}
              onChange={(e) => this.handleFilterChange('pressureMax', e.target.value)}
            />
          </div>

          <button className="apply-filter-button" onClick={this.filterGrippers}>
            Apply Filter
          </button>
          <button className="clear-filter-button" onClick={this.clearFilter}>
            Clear Filter
          </button>

        </div>
        <div className="product-list">
          <h1 className="top">
            Grippers List <FontAwesomeIcon icon={faDatabase} />
          </h1>
          <div className="top">Count of Products: {productCount}</div>
          {filteredGrippers.length > 0 ? (
            filteredGrippers.map((gripper, index) => (

              <div
                key={index}
                className="product-card"
              // onClick={() => this.handleGripperClick(gripper)}
              >
                {gripper.Data.find((data) => data.Property === 'ImageURL') ? (
                  <img
                    src={gripper.Data.find((data) => data.Property === 'ImageURL').Value}
                    alt={gripper['Model Name']}
                  />
                ) : (
                  <p>Image not available</p>
                )}
                <h2>{gripper['Model Name']}</h2>
                {gripper.Data.find(
                  (data) => data.Property === 'Datasheet' && data.Value !== ''
                ) ? (
                  <div>
                    <a
                      href={gripper.Data.find((data) => data.Property === 'Datasheet').Value}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="pdf-icon" /> Datasheet PDF
                    </a>
                  </div>
                ) : (
                  <div>
                    <p>PDF not available</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-data-message">
              <p>No grippers match the selected criteria.</p>
              <FontAwesomeIcon icon={faDatabase} className="faDatabase-icon" />
            </div>
          )}
        </div>

      </div>
    );
  }
}

export default GripperList;
