import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Using axios for API calls

// Create the context
export const ContactContext = createContext();

// Provider component
export const ContactProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds the user information
  const [contactList, setContactList] = useState([]);
 

  // Function to set the logged-in user
  const setUserDetails = (userData) => {
    setUser(userData);
    console.log(userData);
  };

  // Fetch contact list for the logged-in user from the backend
  const fetchContactList = async () => {
    try {
      const response = await axios.get(
        `https://chat-app-backend-weld-two.vercel.app/api/get-contact`,
        {
          withCredentials: true // Enables sending credentials with the request
        }
      );
      setContactList(response.data); // Assume API returns contacts array in data
    } catch (error) {
      console.error('Error fetching contact list:', error);
    }
  };

 
  
  // Function to add a new contact to the contact list
  const addContact = async (contactNumber) => {
    try {
      const response = await axios.post(
        'https://chat-app-backend-weld-two.vercel.app/api/add-contact',
        { contactNumber },
        {
          withCredentials: true // Enables sending credentials with the request
        }
      );

      // Update the local contact list with the newly added contact
      setContactList((prevContacts) => [...prevContacts, response.data.contact]);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };



  useEffect(() => {
    
  }, []);

  return (
    <ContactContext.Provider value={{ user, setUserDetails, contactList, addContact ,setContactList }}>
      {children}
    </ContactContext.Provider>
  );
};
