import React, { useState, useEffect, useContext } from 'react';
import { FormControl, ListGroup } from 'react-bootstrap';
import axiosInstance from '../../utils/axiosUtil';
import { ToastContainer, toast } from 'react-toastify';
import { toastOptions } from '../../utils/error';
import { Store } from '../../states/store';

const AutocompleteSearch = ({ onSelect, searchType }) => {
  console.log({ onSelect })
  const [selectedItem, setSelectedItem] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);

  const { state } = useContext(Store);
  const { token } = state;

  useEffect(() => {
    // Call your API here with the updated search term
    // and update the filtered options based on the API response
    if (searchTerm) {
      (async () => {
        try {
          switch (searchType) {
            case "user":
              var { data } = await axiosInstance(`/api/admin/users/?keyword=${searchTerm}&role=sale-person`, {
                headers: { Authorization: token }
              });
              console.log(data)
              setFilteredOptions(data.users);
              break;

            default:
              return;
          }
        } catch (error) {
          toast.error(error, toastOptions);
        }
      })();
    } else setFilteredOptions([]);
  }, [searchTerm, searchType]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedItem(null);
  };

  const handleSelectOption = (option) => {
    console.log({ option })
    setSearchTerm('');
    onSelect(option);
    setFilteredOptions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      if (!selectedItem) setSelectedItem(filteredOptions.length - 1);
      else setSelectedItem(selectedItem - 1);
    } else if (e.key === 'ArrowDown') {
      console.log({ selectedItem })
      setSelectedItem((prev) => {
        if (prev === filteredOptions.length - 1 || prev === null) return 0;
        return prev + 1;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default Enter behavior
      if (selectedItem !== null && selectedItem >= 0 && selectedItem < filteredOptions.length) {
        handleSelectOption(filteredOptions[selectedItem]);
      } else {
        toast.error("Select a sale person", toastOptions);
      }
    }
  };

  console.log({ filteredOptions })
  return (
    <div style={{ position: "relative" }}>
      <FormControl
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
      />
      {filteredOptions.length > 0 && (
        <ListGroup className="autocomplete-list">
          {searchType === 'user' && filteredOptions.map((user, idx) => {
            const { _id, firstname, lastname, profile_img, email, mobile_no } = user;
            console.log(idx, selectedItem);
            return (
              <ListGroup.Item
                className={`autocomplete-item ${idx === selectedItem ? 'selected' : ''}`}
                key={_id}
                onClick={() => handleSelectOption(user)}
              >
                <div className='d-flex '>
                  <div className='me-3'>
                    <img src={profile_img} alt="img" width={50} height={50} />
                  </div>
                  <div className='w-100'>
                    <span style={{ fontWeight: "700" }}>{firstname} {lastname}</span>
                    <hr style={{ margin: "0px", color: "#36454F" }} />
                    <span style={{ fontSize: "0.9rem" }}><b>Email: </b>{email}</span>
                    <hr style={{ margin: "0px", color: "#36454F" }} />
                    <span style={{ fontSize: "0.9rem" }}><b>Mobile: </b>{mobile_no}</span>
                    <hr style={{ margin: "0px", color: "#36454F" }} />
                  </div>
                </div>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}
      <ToastContainer />
    </div>
  );
};

export default AutocompleteSearch;
