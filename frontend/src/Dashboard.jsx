import React, { useState, useEffect } from "react";
import axios from "axios";
import './Dashboard.css';


export const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/data')
      .then(response => {
        console.log('API Response:', response.data.data); // Log the response data
        setData(response.data.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);
  

  return (
    <div className="dashboard">
      <h2>Data Dashboard</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Attributes</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.data_id}>
                <td>{item.data_id}</td>
                <td>{item.name}</td>
                <td>{item.attributes.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
