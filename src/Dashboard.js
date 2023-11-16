import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    displayManufactureNames: 10,
    displayTypes: 10,
    displayCategories: 10,
    selectedFilters: {
      manufactureName: [],
      type: [],
      category: [],

      payloadMin: '',
      payloadMax: '',
      forceMin: '',
      forceMax: '',
      pressureMin: '',
      pressureMax: '',
      DimensionHeightValuesMin: '',
      DimensionHeightValuesMax: '',
      DimensionDepthValuesMin: '',
      DimensionDepthValuesMax: '',
      DimensionWidthValuesMin: '',
      DimensionWidthValuesMax: '',


    },
    minMaxValues: {},
    filteredGrippers: [],
    selectedGripperDetails: null,
    isModalOpen: false,
    manufactureName: '',
    manufactureType: '',
    manufactureCategory: '',
   
    payload: '',
    grippingForce: '',
    feedGrippingForce: '',
    dimensionHeight: '',
    dimensionDepth: '',
    dimensionWidth: '',
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
      
      payload,
      grippingForce,
      feedGrippingForce,
      dimensionHeight,
      dimensionDepth,
      dimensionWidth,
    } = this.state;

    // Check if at least one field is filled
    if (
      !modelName &&
      !imageUrl &&
      !datasheet &&
      !manufactureName &&
      !manufactureType &&
      !manufactureCategory &&
     
      !payload &&
      !grippingForce &&
      !feedGrippingForce&&
      !dimensionHeight &&
      !dimensionDepth &&
      !dimensionWidth
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
      // dimension:
      {
        Property: "DimensionHeight(MM)",
        Value: dimensionHeight,
      },
      {
        Property: "DimensionDepth(MM)",
        Value: dimensionDepth,
      },
      {
        Property: "DimensionWidth(MM)",
        Value: dimensionWidth,
      },
    ];

    const newGripperData = {
      "Model Name": modelName,
      Data: newData,
    };
    axios.post('http://localhost:3000/api/grippers', newGripperData)
      .then((response) => {

        this.setState({
          modelName: '',
          imageUrl: '',
          datasheet: '',
          manufactureName: '',
          manufactureType: '',
          manufactureCategory: '',

          payload: '',
          grippingForce: '',
          feedGrippingForce: '',
          dimensionHeight: '',
          dimensionDepth: '',
          dimensionWidth: '',
          showAddGripperForm: false,
        });

        toast.success("New Gripper added!", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 2000,
        });
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error adding a gripper:', error);

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
        console.log("Manufacture Names:", manufactureNames);
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


    const payloadMin = parseFloat(selectedFilters.payloadMin);
    const payloadMax = parseFloat(selectedFilters.payloadMax);
    const forceMin = parseFloat(selectedFilters.forceMin);
    const forceMax = parseFloat(selectedFilters.forceMax);
    const pressureMin = parseFloat(selectedFilters.pressureMin);
    const pressureMax = parseFloat(selectedFilters.pressureMax);


    const DimensionHeightValuesMin = parseFloat(selectedFilters.DimensionHeightValuesMin);
    const DimensionHeightValuesMax = parseFloat(selectedFilters.DimensionHeightValuesMax);
    const DimensionDepthValuesMin = parseFloat(selectedFilters.DimensionDepthValuesMin);
    const DimensionDepthValuesMax = parseFloat(selectedFilters.DimensionDepthValuesMax);
    const DimensionWidthValuesMin = parseFloat(selectedFilters.DimensionWidthValuesMin);
    const DimensionWidthValuesMax = parseFloat(selectedFilters.DimensionWidthValuesMax);

    // if (

    //   !isNaN(dimensionMin) && dimensionMin < minMaxValues.dimensionMin ||
    //   !isNaN(payloadMin) && payloadMin < minMaxValues.payloadMin ||
    //   !isNaN(forceMin) && forceMin < minMaxValues.forceMin ||
    //   !isNaN(pressureMin) && pressureMin < minMaxValues.pressureMin ||

    //   !isNaN(dimensionMax) && dimensionMax > minMaxValues.dimensionMax ||
    //   !isNaN(payloadMax) && payloadMax > minMaxValues.payloadMax ||
    //   !isNaN(forceMax) && forceMax > minMaxValues.forceMax ||
    //   !isNaN(pressureMax) && pressureMax > minMaxValues.pressureMax ||

    //   !isNaN(dimensionMin) && dimensionMin > minMaxValues.dimensionMax ||
    //   !isNaN(payloadMin) && payloadMin > minMaxValues.payloadMax ||
    //   !isNaN(forceMin) && forceMin > minMaxValues.forceMax ||
    //   !isNaN(pressureMin) && pressureMin > minMaxValues.pressureMax ||

    //   !isNaN(dimensionMax) && dimensionMax < minMaxValues.dimensionMin ||
    //   !isNaN(payloadMax) && payloadMax < minMaxValues.payloadMin ||
    //   !isNaN(forceMax) && forceMax < minMaxValues.forceMin ||
    //   !isNaN(pressureMax) && pressureMax < minMaxValues.pressureMin


    // ) {

    //   this.setState({
    //     filterError: alert('Invalid range filter  Minimum & minimum values.'),
    //   });
    //   return;
    // }  


    // this.setState({ filterError: '' });

    if (Object.values(selectedFilters).every((value) => !value)) {

      this.setState({
        filteredGrippers: grippers,
        filtersApplied: false,
      });
    } else {
      const filteredGrippers = grippers.filter((gripper) => {
        const manufactureName = selectedFilters.manufactureName;
        const type = selectedFilters.type;
        const category = selectedFilters.category;


        const payloadData = gripper.Data.find((data) => data.Property === 'Payload(Kg)');
        const payloadValue = payloadData ? parseFloat(payloadData.Value) : NaN;


        const forceData = gripper.Data.find((data) => data.Property === 'Gripping Force');
        const forceValue = forceData ? parseFloat(forceData.Value) : NaN;


        const pressureData = gripper.Data.find((data) => data.Property === 'Feed pressure Max');
        const pressureValue = pressureData ? parseFloat(pressureData.Value) : NaN;


        const DimensionHeightData = gripper.Data.find((data) => data.Property === 'DimensionHeight(MM)');
        const DimensionHeightValue = DimensionHeightData ? parseFloat(DimensionHeightData.Value) : NaN;


        const DimensionDepthData = gripper.Data.find((data) => data.Property === 'DimensionDepth(MM)');
        const DimensionDepthValue = DimensionDepthData ? parseFloat(DimensionDepthData.Value) : NaN;

        const DimensionWidthData = gripper.Data.find((data) => data.Property === 'DimensionWidth(MM)');
        const DimensionWidthValue = DimensionWidthData ? parseFloat(DimensionWidthData.Value) : NaN;





        return (
          (!manufactureName.length || manufactureName.includes(gripper.Data.find((data) => data.Property === 'ManufactureName')?.Value)) &&
          (!type.length || type.includes(gripper.Data.find((data) => data.Property === 'Type')?.Value)) &&
          (!category.length || category.includes(gripper.Data.find((data) => data.Property === 'Category')?.Value)) &&


          (isNaN(payloadMin) || (payloadValue >= payloadMin)) &&
          (isNaN(payloadMax) || (payloadValue <= payloadMax)) &&
          (isNaN(forceMin) || (forceValue >= forceMin)) &&
          (isNaN(forceMax) || (forceValue <= forceMax)) &&
          (isNaN(pressureMin) || (pressureValue >= pressureMin)) &&
          (isNaN(pressureMax) || (pressureValue <= pressureMax)) &&

          (isNaN(DimensionHeightValuesMin) || (DimensionHeightValue >= DimensionHeightValuesMin)) &&
          (isNaN(DimensionHeightValuesMax) || (DimensionHeightValue <= DimensionHeightValuesMax)) &&
          (isNaN(DimensionDepthValuesMin) || (DimensionDepthValue >= DimensionDepthValuesMin)) &&
          (isNaN(DimensionDepthValuesMax) || (DimensionDepthValue <= DimensionDepthValuesMax)) &&
          (isNaN(DimensionWidthValuesMin) || (DimensionWidthValue >= DimensionWidthValuesMin)) &&
          (isNaN(DimensionWidthValuesMax) || (DimensionWidthValue <= DimensionWidthValuesMax))

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
        DimensionHeightValuesMin: '',
        DimensionHeightValuesMax: '',
        DimensionDepthValuesMin: '',
        DimensionDepthValuesMax: '',
        DimensionWidthValuesMin: '',
        DimensionWidthValuesMax: '',
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
    this.setState((prevState) => {
      const updatedFilters = { ...prevState.selectedFilters };

      // Toggle the value in the array if the same checkbox is clicked again
      if (updatedFilters[filterName].includes(value)) {
        updatedFilters[filterName] = updatedFilters[filterName].filter((item) => item !== value);
      } else {
        updatedFilters[filterName] = [...updatedFilters[filterName], value];
      }

      return {
        selectedFilters: updatedFilters,
      };
    });
  };



  componentDidUpdate(prevProps, prevState) {
    // Check if the selectedFilters have changed
    if (this.state.selectedFilters !== prevState.selectedFilters) {
      // Call filterGrippers to automatically filter data
      this.filterGrippers();
    }
  }

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


  toggleAddGripperForm = () => {
    this.setState((prevState) => ({
      showAddGripperForm: !prevState.showAddGripperForm,
    }));
  };

  handleLoadMoreManufactureNames = () => {
    this.setState((prevState) => ({
      displayManufactureNames: prevState.displayManufactureNames + 10,
    }));
  };

  handleLoadMoreTypes = () => {
    this.setState((prevState) => ({
      displayTypes: prevState.displayTypes + 10,
    }));
  };

  handleLoadMoreCategories = () => {
    this.setState((prevState) => ({
      displayCategories: prevState.displayCategories + 10,
    }));
  };
  handleIntegerFilterChange = (filterName, value) => {
    this.setState((prevState) => ({
      selectedFilters: {
        ...prevState.selectedFilters,
        [filterName]: value,
      },
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
      dimensionHeight,
      dimensionDepth,
      dimensionWidth,
      payload,
      grippingForce,
      feedGrippingForce,
    } = this.state;

    return (
      <div className="gripper-list-container">
        <div className="filter-options">
          <h2>updated 2.0</h2>

          {/* Checkbox inputs for Manufacture Name */}
          <div className="checkbox-section">
            <label>Manufacture Name:</label>
            {filterOptions.manufactureNames.slice(0, this.state.displayManufactureNames).map((option, index) => (
              <div key={index} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`manufactureNameCheckbox${index}`}
                  value={option}
                  checked={selectedFilters.manufactureName.includes(option)}
                  onChange={() => this.handleFilterChange('manufactureName', option)}
                />
                <label htmlFor={`manufactureNameCheckbox${index}`}>{option}</label>
              </div>
            ))}
            {filterOptions.manufactureNames.length > this.state.displayManufactureNames && (
              <button className="load-more-button" onClick={this.handleLoadMoreManufactureNames}>
                Load More
              </button>
            )}
          </div>

          {/* Checkbox inputs for Type */}
          <div className="checkbox-section">
            <label>Type:</label>
            {filterOptions.types.slice(0, this.state.displayTypes).map((option, index) => (
              <div key={index} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`typeCheckbox${index}`}
                  value={option}
                  checked={selectedFilters.type.includes(option)}
                  onChange={() => this.handleFilterChange('type', option)}
                />
                <label htmlFor={`typeCheckbox${index}`}>{option}</label>
              </div>
            ))}
            {filterOptions.types.length > this.state.displayTypes && (
              <button className="load-more-button" onClick={this.handleLoadMoreTypes}>
                Load More
              </button>
            )}
          </div>

          {/* Checkbox inputs for Category */}
          <div className="checkbox-section">
            <label>Category:</label>
            {filterOptions.categories.slice(0, this.state.displayCategories).map((option, index) => (
              <div key={index} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`categoryCheckbox${index}`}
                  value={option}
                  checked={selectedFilters.category.includes(option)}
                  onChange={() => this.handleFilterChange('category', option)}
                />
                <label htmlFor={`categoryCheckbox${index}`}>{option}</label>
              </div>
            ))}
            {filterOptions.categories.length > this.state.displayCategories && (
              <button className="load-more-button" onClick={this.handleLoadMoreCategories}>
                Load More
              </button>
            )}
          </div>

          <div>
            <label>Payload(Kg) Range:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.payloadMin})`}
              value={selectedFilters.payloadMin}
              onChange={(e) => this.handleIntegerFilterChange('payloadMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.payloadMax})`}
              value={selectedFilters.payloadMax}
              onChange={(e) => this.handleIntegerFilterChange('payloadMax', e.target.value)}
            />
          </div>
          <div>
            <label>Gripping Force Range:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.forceMin})`}
              value={selectedFilters.forceMin}
              onChange={(e) => this.handleIntegerFilterChange('forceMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.forceMax})`}
              value={selectedFilters.forceMax}
              onChange={(e) => this.handleIntegerFilterChange('forceMax', e.target.value)}
            />
          </div>
          <div>
            <label>Feed pressure Max Range:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.pressureMin})`}
              value={selectedFilters.pressureMin}
              onChange={(e) => this.handleIntegerFilterChange('pressureMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.pressureMax})`}
              value={selectedFilters.pressureMax}
              onChange={(e) => this.handleIntegerFilterChange('pressureMax', e.target.value)}
            />
          </div>

          {/* dimensionHeight */}
          <div>
            <h2>Dimension</h2>
            <label>Height:</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.DimensionHeightValuesMin})`}
              value={selectedFilters.DimensionHeightValuesMin}
              onChange={(e) => this.handleIntegerFilterChange('DimensionHeightValuesMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.DimensionHeightValuesMax})`}
              value={selectedFilters.DimensionHeightValuesMax}
              onChange={(e) => this.handleIntegerFilterChange('DimensionHeightValuesMax', e.target.value)}
            />
          </div>

          {/* dimensionDepth */}
          <div>
            <label>Depth</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.DimensionDepthValuesMin})`}
              value={selectedFilters.DimensionDepthValuesMin}
              onChange={(e) => this.handleIntegerFilterChange('DimensionDepthValuesMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.DimensionDepthValuesMax})`}
              value={selectedFilters.DimensionDepthValuesMax}
              onChange={(e) => this.handleIntegerFilterChange('DimensionDepthValuesMax', e.target.value)}
            />
          </div>

          {/* dimensionWidth */}
          <div>
            <label>Width</label>
            <input
              type="number"
              placeholder={`Min (${minMaxValues.DimensionWidthValuesMin})`}
              value={selectedFilters.DimensionWidthValuesMin}
              onChange={(e) => this.handleIntegerFilterChange('DimensionWidthValuesMin', e.target.value)}
            />
            <input
              type="number"
              placeholder={`Max (${minMaxValues.DimensionWidthValuesMax})`}
              value={selectedFilters.DimensionWidthValuesMax}
              onChange={(e) => this.handleIntegerFilterChange('DimensionWidthValuesMax', e.target.value)}
            />
          </div>

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
                  <label>Payload(Kg) :</label>
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
                <h4>Dimension</h4>
                {/* dimensionHeight */}
                <div className="form-row">

                  <label>Height</label>
                  <input
                    type="text"
                    value={dimensionHeight}
                    onChange={(e) => this.setState({ dimensionHeight: e.target.value })}
                  />
                </div>
                {/* dimensionDepth */}
                <div className="form-row">
                  <label>Depth</label>
                  <input
                    type="text"
                    value={dimensionDepth}
                    onChange={(e) => this.setState({ dimensionDepth: e.target.value })}
                  />
                </div>
                {/* dimensionwidth */}
                <div className="form-row">
                  <label>width</label>
                  <input
                    type="text"
                    value={dimensionWidth}
                    onChange={(e) => this.setState({ dimensionWidth: e.target.value })}
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
        <ToastContainer />
      </div>
    );
  }
}

export default GripperList;
