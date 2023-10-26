import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faDatabase ,faBarsStaggered} from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import './App.css';

class GripperList extends Component {
  state = {
    grippers: [],
    selectedGripper: null,
    showModal: false, 
    filterOptions: {
      manufactureNames: [],
      types: [],
      categories: [],
    },
    selectedFilters: {
      manufactureName: '',
      type: '',
      category: '',
    },
    filteredGrippers: [],
  };
  componentDidMount() {
    // Fetch gripper data from the server
    axios.get('http://localhost:3000/api/grippers')
      .then((response) => {
        const grippers = response.data;
        const manufactureNames = [...new Set(grippers.map(gripper => gripper.Data.find(data => data.Property === 'ManufactureName').Value).filter(Boolean))];
        const types = [...new Set(grippers.map(gripper => gripper.Data.find(data => data.Property === 'Type').Value).filter(Boolean))];
        const categories = [...new Set(grippers.map(gripper => gripper.Data.find(data => data.Property === 'Category').Value).filter(Boolean))];
        this.setState({
          grippers,
          filterOptions: {
            manufactureNames,
            types,
            categories,
          },
          filteredGrippers: grippers,
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

  applyFilter = () => {
    // Apply the filter when the "Submit" button is clicked
    this.closeModal();
    this.filterGrippers();
  };

  filterGrippers = () => {
    const { grippers, selectedFilters } = this.state;

    const filteredGrippers = grippers.filter((gripper) => {
      const manufactureName = gripper.Data.find(data => data.Property === 'ManufactureName').Value;
      const type = gripper.Data.find(data => data.Property === 'Type').Value;
      const category = gripper.Data.find(data => data.Property === 'Category').Value;

      return (
        (selectedFilters.manufactureName === '' || manufactureName === selectedFilters.manufactureName) &&
        (selectedFilters.type === '' || type === selectedFilters.type) &&
        (selectedFilters.category === '' || category === selectedFilters.category)
      );
    });

    this.setState({ filteredGrippers });
  };

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };
  cancelFilter = () => {
    this.closeModal();
    this.setState({
      selectedFilters: { manufactureName: '', type: '', category: '' },
      filteredGrippers: this.state.grippers, // Reset the filtered data to the original dataset
    });
  };
  
  handleGripperClick = (gripper) => {
    this.setState({ selectedGripper: gripper });
  };

  render() {
    const { filteredGrippers, filterOptions, selectedFilters, showModal, selectedGripper } = this.state;
    const productCount = filteredGrippers.length; 

    return (
      <div className="container">
        <h1 className="title">Grippers List  <FontAwesomeIcon icon={faDatabase} /> </h1>
       
        <div className="product-count">Count of Products: {productCount}</div>
        <button className='button-7' onClick={this.openModal}>Filter</button>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
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
              <button className='button-18' onClick={this.applyFilter}>Submit</button>
              <button  className="button-19" onClick={this.cancelFilter}>Cancel</button>
            </div>
          </div>
        )}

        <div className="product-list">
          {filteredGrippers.length > 0 ? (
            filteredGrippers.map((gripper, index) => (
              <div
                key={index}
                onClick={() => this.handleGripperClick(gripper)}
                className="product-card"
              >
                {/* Display the image from the current gripper's ImageURL property */}
                {gripper.Data.find((data) => data.Property === 'ImageURL') ? (
                  <img
                    src={gripper.Data.find((data) => data.Property === 'ImageURL').Value}
                    alt={gripper["Model Name"]}
                  />
                ) : (
                  <p>Image not available</p>
                )}
                <h2>{gripper["Model Name"]}</h2>
                {gripper.Data.find((data) => data.Property === 'Datasheet' && data.Value !== '') ? (
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
        {selectedGripper && (
          <div className="selected-gripper-details">
            {/* Display selected gripper details here */}
          </div>
        )}
      </div>
    );
  }
}

export default GripperList;
