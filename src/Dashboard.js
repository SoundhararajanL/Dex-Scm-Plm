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
      dimensionMin: '', 
      dimensionMax: '', 
      payloadMin: '', 
      payloadMax: '', 
      forceMin: '', 
      forceMax: '', 
      pressureMin: '', 
      pressureMax: '',
    },
    minMaxValues: {},
    filteredGrippers: [],
    selectedGripperDetails: null,
    isModalOpen: false,
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
    const { grippers, selectedFilters } = this.state;
  
    const filteredGrippers = grippers.filter((gripper) => {
      const manufactureName = gripper.Data.find((data) => data.Property === 'ManufactureName');
      const type = gripper.Data.find((data) => data.Property === 'Type');
      const category = gripper.Data.find((data) => data.Property === 'Category');
    
  
      return (
        (!selectedFilters.manufactureName || manufactureName.Value === selectedFilters.manufactureName) &&
        (!selectedFilters.type || type.Value === selectedFilters.type) &&
        (!selectedFilters.category || category.Value === selectedFilters.category) &&
    
        this.validateAndFilterNumeric(gripper, 'Dimension(MM)', 'dimension', selectedFilters) &&
        this.validateAndFilterNumeric(gripper, 'Payload(Kg)', 'payload', selectedFilters) &&
        this.validateAndFilterNumeric(gripper, 'Gripping Force', 'force', selectedFilters) &&
        this.validateAndFilterNumeric(gripper, 'Feed pressure Max', 'pressure', selectedFilters)
      );
    });
  
    this.setState({ filteredGrippers });  
    this.setState({ filtersApplied: true });
    console.log("filter data ", filteredGrippers)
  };
  validateAndFilterNumeric = (gripper, property, filterName, selectedFilters) => {
    const valueData = gripper.Data.find((data) => data.Property === property);
    if (!valueData || isNaN(parseFloat(valueData.Value))) {
      return true; // Don't filter this gripper if the property doesn't exist or is not a valid number
    }
  
    const value = parseFloat(valueData.Value);
    const minValue = parseFloat(selectedFilters[`${filterName}Min`]);
    const maxValue = parseFloat(selectedFilters[`${filterName}Max`]);
  
    if (!isNaN(minValue) && value < minValue) {
      return false; // Filter out if the value is less than the min value
    }
  
    if (!isNaN(maxValue) && value > maxValue) {
      return false; // Filter out if the value is greater than the max value
    }
  
    return true;
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
      filteredGrippers: this.state.grippers,
    }), () => {
      this.setState({ filtersApplied: false });
    });
  };

  openGripperDetails = (gripper) => {
    this.setState({
      selectedGripperDetails: gripper,
      isModalOpen: true,
    });
  };

  closeGripperDetails = () => {
    this.setState({
      selectedGripperDetails: null,
      isModalOpen: false, // Close the modal
    });
  };

  handleDimensionRangeChange = (values) => {
    this.setState((prevState) => ({
      selectedFilters: {
        ...prevState.selectedFilters,
        dimensionMin: values[0],
        dimensionMax: values[1],
      },
    }));
  };

  render() {
    const { isModalOpen, selectedGripperDetails } = this.state;
    const { filteredGrippers, filterOptions, selectedFilters, filtersApplied } = this.state;
    const productCount = filteredGrippers.length;
    const { minMaxValues } = this.state;

    const dimensionMin = selectedFilters.dimensionMin;
    const dimensionMax = selectedFilters.dimensionMax;

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
              placeholder={`Min (${minMaxValues.dimensionMin})`}
              value={selectedFilters.dimensionMin}
              onChange={(e) => this.handleFilterChange('dimensionMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.dimensionMax})`}
              value={selectedFilters.dimensionMax}
              onChange={(e) => this.handleFilterChange('dimensionMax', e.target.value)}
            />
          </div>
          <div>
            <label>Payload(Kg) Range:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.payloadMin})`}
              value={selectedFilters.payloadMin}
              onChange={(e) => this.handleFilterChange('payloadMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.payloadMax})`}
              value={selectedFilters.payloadMax}
              onChange={(e) => this.handleFilterChange('payloadMax', e.target.value)}
            />
          </div>
          <div>
            <label>Gripping Force Range:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.forceMin})`}
              value={selectedFilters.forceMin}
              onChange={(e) => this.handleFilterChange('forceMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.forceMax})`}
              value={selectedFilters.forceMax}
              onChange={(e) => this.handleFilterChange('forceMax', e.target.value)}
            />
          </div>
          <div>
            <label>Feed pressure Max Range:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.pressureMin})`}
              value={selectedFilters.pressureMin}
              onChange={(e) => this.handleFilterChange('pressureMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.pressureMax})`}
              value={selectedFilters.pressureMax}
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
              <div key={index} className="product-card">
                <div onClick={() => this.openGripperDetails(gripper)}>
                  {gripper.Data.find((data) => data.Property === 'ImageURL') ? (
                    <img
                      src={gripper.Data.find((data) => data.Property === 'ImageURL').Value}
                      alt={gripper['Model Name']}
                    />
                  ) : (
                    <p>Image not available</p>
                  )}
                  <h2>{gripper['Model Name']}</h2>
                </div>
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
          {selectedGripperDetails && (
            <div className={`modal ${isModalOpen ? 'show' : ''}`}>
              <div className="modal-content">
                <span className="close" onClick={this.closeGripperDetails}>&times;</span>
                <h2>Selected Gripper: {selectedGripperDetails['Model Name']}</h2>
                <table className="gripper-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGripperDetails.Data.filter(data => data.Property !== 'ImageURL' && data.Property !== 'Datasheet').map((data, dataIndex) => (
                      <tr key={dataIndex}>
                        <td>{data.Property}</td>
                        <td>{data.Value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default GripperList;