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

export function JSONToHTMLTable(jsonData:any) {           

            //This Code gets all columns for header   and stored in array col
            var col = [];
            for (var i = 0; i < jsonData.length; i++) {
                for (var key in jsonData[i]) {
                    if (col.indexOf(key) === -1) {
                        col.push(key);
                    }
                }
            }

            //This Code creates HTML table
            var table = document.createElement("table");

            //This Code getsrows for header creader above.
            var tr = table.insertRow(-1);

            for (var i = 0; i < col.length; i++) {
                var th = document.createElement("th");
                th.innerHTML = col[i];
                tr.appendChild(th);
            }

            //This Code adds data to table as rows
            for (var i = 0; i < jsonData.length; i++) {

                tr = table.insertRow(-1);

                for (var j = 0; j < col.length; j++) {
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = jsonData[i][col[j]];
                }
            }

            //This Code gets the all columns for header
            var divContainer = document.createElement('div');
            divContainer?.appendChild(table);

            return divContainer.innerHTML;
        }
