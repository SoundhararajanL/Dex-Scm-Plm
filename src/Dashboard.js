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
    manufactureName: '',
  manufactureType: '',
  manufactureCategory: '',
  dimension: '',
  payload: '',
  grippingForce: '',
  feedGrippingForce: '',
  showAddGripperForm: false,
  };

  handleAddGripper = () => {
    const {
      modelName,
      imageUrl,
      datasheet,
      manufactureName,
      manufactureType,
      manufactureCategory,
      dimension,
      payload,
      grippingForce,
      feedGrippingForce,
    } = this.state;

    // Check if at least one field is filled
  if (
    !modelName &&
    !imageUrl &&
    !datasheet &&
    !manufactureName &&
    !manufactureType &&
    !manufactureCategory &&
    !dimension &&
    !payload &&
    !grippingForce &&
    !feedGrippingForce
  ) {
    alert('At least one field is required');
    return;
  }

  

  

    const newData = [
      {
        Property: "ImageURL",
        Value: imageUrl,
      },
      {
        Property: "Datasheet",
        Value: datasheet,
      },
      {
        Property: "ManufactureName",
        Value: manufactureName,
      },
      {
        Property: "Type",
        Value: manufactureType,
      },
      {
        Property: "Category",
        Value: manufactureCategory,
      },
      {
        Property: "Dimension(MM)",
        Value: dimension,
      },
      {
        Property: "Payload(Kg)",
        Value: payload,
      },
      {
        Property: "Gripping Force",
        Value: grippingForce,
      },
      {
        Property: "Feed pressure Max",
        Value: feedGrippingForce,
      },
    ];

    const newGripperData = {
      "Model Name": modelName,
      Data: newData,
    };
    axios.post('http://localhost:3000/api/grippers', newGripperData)
      .then((response) => {
        // Handle success, clear input fields or show a success message
        this.setState({
          modelName: '',
          imageUrl: '',
          datasheet: '',
          manufactureName: '',
          manufactureType: '',
          manufactureCategory: '',
          dimension: '',
          payload: '',
          grippingForce: '',
          feedGrippingForce: '',
          showAddGripperForm: false,
        });

        // You may also update the grippers list if needed
      })
      .catch((error) => {
        console.error('Error adding a gripper:', error);
        // Handle error, show an error message, etc.
      });
  };


  componentDidMount() {
    // Fetch gripper data from the server
    axios.get('http://localhost:3000/api/grippers')
      .then((response) => {
        const grippers = response.data;

        const manufactureNames = [...new Set(grippers.map((gripper) => gripper.Data.find((data) => data.Property === 'ManufactureName')?.Value).filter(Boolean))];
        const types = [...new Set(grippers.map((gripper) => gripper.Data.find((data) => data.Property === 'Type')?.Value).filter(Boolean))];
        const categories = [...new Set(grippers.map((gripper) => gripper.Data.find((data) => data.Property === 'Category')?.Value).filter(Boolean))];

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
              minMaxValues,
              filteredGrippers: grippers, // Set filteredGrippers initially to the full data
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



  filterGrippers = () => {
    const { grippers, selectedFilters, minMaxValues } = this.state;

    const dimensionMin = parseFloat(selectedFilters.dimensionMin);
    const dimensionMax = parseFloat(selectedFilters.dimensionMax);
    const payloadMin = parseFloat(selectedFilters.payloadMin);
    const payloadMax = parseFloat(selectedFilters.payloadMax);
    const forceMin = parseFloat(selectedFilters.forceMin);
    const forceMax = parseFloat(selectedFilters.forceMax);
    const pressureMin = parseFloat(selectedFilters.pressureMin);
    const pressureMax = parseFloat(selectedFilters.pressureMax);


    if (

      !isNaN(dimensionMin) && dimensionMin < minMaxValues.dimensionMin ||
      !isNaN(payloadMin) && payloadMin < minMaxValues.payloadMin ||
      !isNaN(forceMin) && forceMin < minMaxValues.forceMin ||
      !isNaN(pressureMin) && pressureMin < minMaxValues.pressureMin ||

      !isNaN(dimensionMax) && dimensionMax > minMaxValues.dimensionMax ||
      !isNaN(payloadMax) && payloadMax > minMaxValues.payloadMax ||
      !isNaN(forceMax) && forceMax > minMaxValues.forceMax ||
      !isNaN(pressureMax) && pressureMax > minMaxValues.pressureMax ||

      !isNaN(dimensionMin) && dimensionMin > minMaxValues.dimensionMax ||
      !isNaN(payloadMin) && payloadMin > minMaxValues.payloadMax ||
      !isNaN(forceMin) && forceMin > minMaxValues.forceMax ||
      !isNaN(pressureMin) && pressureMin > minMaxValues.pressureMax ||





      !isNaN(dimensionMax) && dimensionMax < minMaxValues.dimensionMin ||
      !isNaN(payloadMax) && payloadMax < minMaxValues.payloadMin ||
      !isNaN(forceMax) && forceMax < minMaxValues.forceMin ||
      !isNaN(pressureMax) && pressureMax < minMaxValues.pressureMin






    ) {

      this.setState({
        filterError: alert('Invalid range filter  Minimum & minimum values.'),
      });
      return;
    }

    // Clear the error message if the filters are valid
    this.setState({ filterError: '' });

    if (Object.values(selectedFilters).every((value) => !value)) {
      // No filters are set, return all grippers
      this.setState({
        filteredGrippers: grippers,
        filtersApplied: false,
      });
    } else {
      const filteredGrippers = grippers.filter((gripper) => {
        const manufactureName = selectedFilters.manufactureName;
        const type = selectedFilters.type;
        const category = selectedFilters.category;
        const dimensionMin = parseFloat(selectedFilters.dimensionMin);
        const dimensionMax = parseFloat(selectedFilters.dimensionMax);

        const dimensionValues = grippers.map((gripper) => {
          const dimensionValue = gripper.Data.find((data) => data.Property === 'Dimension(MM)').Value;

          if (!dimensionValue) {
            return null;
          }

          const [min, max] = dimensionValue.split('-').map(parseFloat);
          return { min, max };
        }).filter(Boolean);

        // Check if 'Payload(Kg)' is empty before parsing
        const payloadData = gripper.Data.find((data) => data.Property === 'Payload(Kg)');
        const payloadValue = payloadData ? parseFloat(payloadData.Value) : NaN;

        // Check if 'Gripping Force' is empty before parsing
        const forceData = gripper.Data.find((data) => data.Property === 'Gripping Force');
        const forceValue = forceData ? parseFloat(forceData.Value) : NaN;

        // Check if 'Feed pressure Max' is empty before parsing
        const pressureData = gripper.Data.find((data) => data.Property === 'Feed pressure Max');
        const pressureValue = pressureData ? parseFloat(pressureData.Value) : NaN;


        const payloadMin = parseFloat(selectedFilters.payloadMin);
        const payloadMax = parseFloat(selectedFilters.payloadMax);
        const forceMin = parseFloat(selectedFilters.forceMin);
        const forceMax = parseFloat(selectedFilters.forceMax);
        const pressureMin = parseFloat(selectedFilters.pressureMin);
        const pressureMax = parseFloat(selectedFilters.pressureMax);


        // Extract the dimension range values
        const dimensionData = gripper.Data.find((data) => data.Property === 'Dimension(MM)');
        const dimensionValue = dimensionData ? dimensionData.Value : '';
        const [minDimension, maxDimension] = dimensionValue.split('-').map(parseFloat);

        // Check if the gripper matches the filter criteria
        return (
          (!manufactureName || gripper.Data.find((data) => data.Property === 'ManufactureName')?.Value === manufactureName) &&
          (!type || gripper.Data.find((data) => data.Property === 'Type')?.Value === type) &&
          (!category || gripper.Data.find((data) => data.Property === 'Category')?.Value === category) &&
          (isNaN(selectedFilters.dimensionMin) || (minDimension >= selectedFilters.dimensionMin)) &&
          (isNaN(selectedFilters.dimensionMax) || (maxDimension <= selectedFilters.dimensionMax)) &&
          (isNaN(payloadMin) || (payloadValue >= payloadMin)) &&
          (isNaN(payloadMax) || (payloadValue <= payloadMax)) &&
          (isNaN(forceMin) || (forceValue >= forceMin)) &&
          (isNaN(forceMax) || (forceValue <= forceMax)) &&
          (isNaN(pressureMin) || (pressureValue >= pressureMin)) &&
          (isNaN(pressureMax) || (pressureValue <= pressureMax))
        );
      });
      console.log("filter data", filteredGrippers)
      this.setState({
        filteredGrippers: filteredGrippers,
        filtersApplied: true,
      });
    }
  };
  
  clearFilter = () => {
    this.setState({
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
    }, () => {
      // Call the filterGrippers function inside the callback to ensure it's called after state is updated
      this.filterGrippers();
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

  

  openGripperDetails = (gripper) => {
    this.setState({
      selectedGripperDetails: gripper,
      isModalOpen: true,
    });
  };

  handleGripperClick = (gripper) => {
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
  toggleAddGripperForm = () => {
    this.setState((prevState) => ({
      showAddGripperForm: !prevState.showAddGripperForm,
    }));
  };

  render() {
    const { isModalOpen, selectedGripperDetails } = this.state;
    const { filteredGrippers, filterOptions, selectedFilters } = this.state;
    const productCount = filteredGrippers.length;
    const { minMaxValues } = this.state;
    const { showAddGripperForm } = this.state;
    const {
      modelName,
      imageUrl,
      datasheet,
      manufactureName,
      manufactureType,
      manufactureCategory,
      dimension,
      payload,
      grippingForce,
      feedGrippingForce,
    } = this.state;

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
            <div className="range-slider">
              <input
                type="range"
                min={minMaxValues.dimensionMin}
                max={minMaxValues.dimensionMax}
                value={selectedFilters.dimensionMin}
                onChange={(e) => this.handleFilterChange('dimensionMin', e.target.value)}
              />
              <input
                type="range"
                min={minMaxValues.dimensionMin}
                max={minMaxValues.dimensionMax}
                value={selectedFilters.dimensionMax}
                onChange={(e) => this.handleFilterChange('dimensionMax', e.target.value)}
              />
            </div>
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
          {/* Add the "Add Gripper" button to toggle the form */}
          <button className="add-gripper-button" onClick={this.toggleAddGripperForm}>
  Add Gripper
</button>


          {/* Display the "Add Gripper" form when the state property is true */}
          
{showAddGripperForm ? (
  <div className={`modal ${isModalOpen ? 'show' : ''}`}>
    <div className="modal-content">
      <span className="close" onClick={this.toggleAddGripperForm}>&times;</span>
      <h2>Add Gripper</h2>
      <div className="form-row">
        <label>Model Name:</label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => this.setState({ modelName: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Image URL:</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => this.setState({ imageUrl: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Datasheet:</label>
        <input
          type="text"
          value={datasheet}
          onChange={(e) => this.setState({ datasheet: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Manufacture Name:</label>
        <input
          type="text"
          value={manufactureName}
          onChange={(e) => this.setState({ manufactureName: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Manufacture Type:</label>
        <input
          type="text"
          value={manufactureType}
          onChange={(e) => this.setState({ manufactureType: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Manufacture Category:</label>
        <input
          type="text"
          value={manufactureCategory}
          onChange={(e) => this.setState({ manufactureCategory: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Dimension:</label>
        <input
          type="text"
          value={dimension}
          onChange={(e) => this.setState({ dimension: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Payload:</label>
        <input
          type="text"
          value={payload}
          onChange={(e) => this.setState({ payload: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Gripping Force:</label>
        <input
          type="text"
          value={grippingForce}
          onChange={(e) => this.setState({ grippingForce: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>Feed Gripping Force:</label>
        <input
          type="text"
          value={feedGrippingForce}
          onChange={(e) => this.setState({ feedGrippingForce: e.target.value })}
        />
      </div>
      <div className="form-row">
      <button className="submit-button" onClick={this.handleAddGripper}>Submit</button>

        <button className="cancel-button" onClick={this.toggleAddGripperForm}>Cancel</button>
      </div>
    </div>
  </div>
) : null}

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
      {gripper.Data.find((data) => data.Property === 'Datasheet') ? (
        gripper.Data.find((data) => data.Property === 'Datasheet').Value ? (
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
          <p>PDF not available</p>
        )
      ) : (
        <p>PDF not available</p>
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