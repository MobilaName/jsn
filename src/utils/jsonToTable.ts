// Function to recursively convert JSON to table rows
export const jsonToTableHtml = (data: any[]) => {
  // Helper function to handle nested objects and arrays
  const createTableRows = (obj: any) => {
    let rows = '';

    if (!obj) {
      return rows;
    }

    if (typeof obj !== 'object') {
      return `
        ${obj}
      `;
    }
    
    // Loop through all keys in the object
    Object.keys(obj).forEach((key:string|number) => {
      const value = obj[key];

      // If the value is an object, we recurse and create a nested table
      if (typeof value === 'object' && !Array.isArray(value)) {
        rows += `
          <tr>
            <td><strong>${key}</strong></td>
            <td>
              <table border="1">
                <tbody>${createTableRows(value)}</tbody>
              </table>
            </td>
          </tr>
        `;
      } 
      // If the value is an array, we loop through each item and create rows for it
      else if (Array.isArray(value)) {
        rows += `
          <tr>
            <td><strong>${key}</strong></td>
            <td>
              <table border="1">
                <tbody>
                  ${value.map((item) => `
                    <tr>
                      <td colspan="2">${createTableRows(item)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </td>
          </tr>
        `;
      } 
      // For primitive values (string, number, etc.)
      else {
        rows += `
          <tr>
            <td><strong>${key}</strong></td>
            <td>${String(value)}</td>
          </tr>
        `;
      }
    });
    
    return rows;
  };

  // Return the full HTML table as a string
  return `
    <table border="1">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>${createTableRows(data)}</tbody>
    </table>
  `;
};
