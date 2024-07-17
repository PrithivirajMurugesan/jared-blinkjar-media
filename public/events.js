// Get the data from the API

  async function getData() {
    try {  
      const response = await fetch("http://localhost:3000/api/schedules").then(
        (res) => res.json()
      );
      return response;
    } catch (error) {
      console.error("Error fetching data:", error); // Handle any errors
    }
  }

  async function downloadPDF() {
    try {

      const { jsPDF } = window.jspdf;
      
        const canvas = await html2canvas(document.body);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('webpage.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

  // download as pdf ends


  
  // Filtered Select Option starts
  
  const branches = new Set();
  const studios = new Set();
  const titles = new Set();
  
  function populateDropdown(elementId, values, allOptionText) {
    const dropdown = document.getElementById(elementId);
    dropdown.innerHTML = "";
  
     // Add 'All' option
     const allOption = document.createElement("option");
     allOption.value = "all";
     allOption.text = allOptionText;
     allOption.id = "all";
     dropdown.appendChild(allOption);
     
     values.forEach((value) => {
       const option = document.createElement("option");
      option.value = value;
      option.text = value;
      option.id = value.replace(' ','-').toLowerCase();
      dropdown.appendChild(option);
    });

    // Initial update when the page loads
   updateDropdown2();
  }

// Populate the dropdown 

  const setPoplulateData = async () => {
    const response = await getData();
     response.items.forEach((item) => {
        if (item.branch_name) branches.add(item.branch_name);
        if (item.studio_name) studios.add(item.studio_name);
        if (item.title) titles.add(item.title);
      });
    populateDropdown("branchDropdown1", branches, "Select Location");
    populateDropdown("studioDropdown", studios, "All Studios");
    populateDropdown("titleDropdown", titles, "All classes");
  };
  
  setPoplulateData();



   // get the item from local storage starts
   
   // Function to update the second dropdown based on the value from localStorage
   const updateDropdown2 = () => {
     const selectedValue = localStorage.getItem('selectedValue');
     const dropDownnSelectedOption = document.getElementById('branchDropdown1');
     if(dropDownnSelectedOption){
       if (selectedValue) dropDownnSelectedOption.value = selectedValue;
      }
   };

   // Update the dropdown when the localStorage value changes
   window.addEventListener('storage', updateDropdown2);

 // get the item from local storage ends
  

// Render the DOM 
  
  document.addEventListener("DOMContentLoaded", async function () {
  let data = await getData();
    const branchDropdown = document.getElementById("branchDropdown1");
    const studioDropdown = document.getElementById("studioDropdown");
    const titleDropdown = document.getElementById("titleDropdown");
    const infoMessage = document.getElementById("infoMessage");


    function renderCalendar(filteredEvents, startDate) {
      const calendarElement = document.getElementById("calendar");
      calendarElement.innerHTML = ""; // Clear previous calendar content
      const daysInWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
      // Ensure filteredEvents is an array before proceeding
      if (!Array.isArray(filteredEvents)) {
          filteredEvents = []; // Initialize as an empty array if not already
      }
      // Adjust startDate to the nearest previous Monday
      startDate = new Date(startDate);
      const dayOffset = (startDate.getDay() + 6) % 7; // Calculate days since last Monday
      startDate.setDate(startDate.getDate() - dayOffset);
      const groupedItems = filteredEvents.reduce((acc, item) => {
          const date = item.start_at.split("T")[0]; // Extract the date portion from start_at
          const time = item.start_at.split("T")[1].slice(0, 5); // Extract the time portion from start_at
          const existingGroup = acc.find((group) => group.date === date);
          if (existingGroup) {
              existingGroup.events.push({ ...item, time });
          } else {
              acc.push({ date: date, events: [{ ...item, time }] });
          }
          return acc;

      }, []);
  
      // Extract unique time slots with events
      const timeSlots = [...new Set(filteredEvents.map(event => event.start_at.split("T")[1].slice(0, 5)))].sort();
  
  
      let table = document.createElement("table");
  
      // Create table header with days of the week and weekend
      let headerRow = document.createElement("tr");
      let timeHeader = document.createElement("th");
      timeHeader.textContent = "WEEKDAYS";
      headerRow.appendChild(timeHeader);
      // Create headers for weekdays  
      for (let i = 0; i < 5; i++) { // Monday to Friday
          let headerDay = document.createElement("th");
          let date = new Date(startDate);
          date.setDate(date.getDate() + i);
          headerDay.innerHTML = `<div class="date_day"><p class="dateIn">${date.getDate()}</p><span class="dayIn">${daysInWeek[i]}</span></div>`;
          headerRow.appendChild(headerDay);
      }
      // Create a combined header for the weekend time slots
      let weekendHeader = document.createElement("th");
      weekendHeader.textContent = "WEEKEND";
      weekendHeader.classList.add("weekend-column");
      headerRow.appendChild(weekendHeader);
  
      // Create headers for Saturday and Sunday
      let saturdayHeader = document.createElement("th");
      let saturdayDate = new Date(startDate);
      saturdayDate.setDate(saturdayDate.getDate() + 5);
      saturdayHeader.innerHTML = `<div class="date_day"><p class="dateIn">${saturdayDate.getDate()}</p><span class="dayIn">${daysInWeek[5]}</span></div>`;
      headerRow.appendChild(saturdayHeader);
  
      let sundayHeader = document.createElement("th");
      let sundayDate = new Date(startDate);
      sundayDate.setDate(sundayDate.getDate() + 6);
      sundayHeader.innerHTML = `<div class="date_day"><p class="dateIn">${sundayDate.getDate()}</p><span class="dayIn">${daysInWeek[6]}</span></div>`;
      headerRow.appendChild(sundayHeader);
  
      // Add headers to the table
      table.appendChild(headerRow);
  
      // Create rows for each time slot
      timeSlots.forEach(slot => {
          let hasEvents = false;
          let row = document.createElement("tr");
          hasEvents ? "" : row;
          let timeCell = document.createElement("td");
          timeCell.textContent = slot;
          row.appendChild(timeCell);
  
  
          // Create cells for weekdays
          for (let i = 0; i < 5; i++) { // Monday to Friday
              let cell = document.createElement("td");
              let date = new Date(startDate);
              date.setDate(date.getDate() + i);
              let events = groupedItems.find(eventGroup => new Date(eventGroup.date).toDateString() === date.toDateString());
  
              if (events) {
                  let event = events.events.find(event => event.time === slot);
                  if (event) {
                   // Generate the local file path based on event.id
        const localImagePath = `assets/images/event_${event.id}.png`;
                      cell.innerHTML = `${localImagePath && event.instructor_name && event.id ?
                          `<div class="event">
                              ${localImagePath ? `<img src="${localImagePath}" alt="${event.source_assoc_name}" />` : ""}
                              ${event.instructor_name ? `<div>${event.instructor_name}</div>` : ""}
                          </div>` : ""
                      }`;

                      hasEvents = true;
                  }
              }
             
                  row.appendChild(cell);

  
          }



  
          // Create a cell for the weekend timeslots
          let weekendCell = document.createElement("td");
          weekendCell.textContent = slot;
          weekendCell.classList.add("weekend-column");
          row.appendChild(weekendCell);
  
          // Create cell for Saturday
          let saturdayCell = document.createElement("td");
          let saturdayDate = new Date(startDate);
          saturdayDate.setDate(saturdayDate.getDate() + 5);
          let saturdayEvents = groupedItems.find(eventGroup => new Date(eventGroup.date).toDateString() === saturdayDate.toDateString());
  
          if (saturdayEvents) {
              let event = saturdayEvents.events.find(event => event.time === slot);
  
              if (event) {
                  saturdayCell.innerHTML = `
                      <div class="event">
                          ${event.thumbnail_url ? `<img src="${event.thumbnail_url}" alt="${event.source_assoc_name}" />` : ""}
                          ${event.instructor_name ? `<div>${event.instructor_name}</div>` : ""}
                      </div>
                  `;
                  hasEvents = true;
              }
          
                  row.appendChild(saturdayCell);
          
          }
         
  
  
          // Create cell for Sunday
          let sundayCell = document.createElement("td");
          let sundayDate = new Date(startDate);
          sundayDate.setDate(sundayDate.getDate() + 6);
          let sundayEvents = groupedItems.find(eventGroup => new Date(eventGroup.date).toDateString() === sundayDate.toDateString());
  
          if (sundayEvents) {
              let event = sundayEvents.events.find(event => event.time === slot);
  
              if (event) {
                  sundayCell.innerHTML = `
                      <div class="event">
                          ${event.thumbnail_url ? `<img src="${event.thumbnail_url}" alt="${event.source_assoc_name}" />` : ""}
                          ${event.instructor_name ? `<div>${event.instructor_name}</div>` : ""}
                      </div>
                  `;
                  hasEvents = true;
              }
          
                  row.appendChild(sundayCell);
              
          }
  
          // Only append the row if it has events
          if (hasEvents) {
              table.appendChild(row);
          }

          if(row.getElementsByClassName("event").length > 0){
              // row.style.display = "block";
          }
          else{
              row.style.display = "none";
          }
      });
  
      // Append the table to the calendar element
      calendarElement.appendChild(table);
  }
  
  
      function handleInitialState() {
        const selectedBranch = branchDropdown.value;
  
      if (selectedBranch === "all") {
        // Display info message and hide other dropdowns
        infoMessage.style.display = "block";
        studioDropdown.style.display = "none";
        titleDropdown.style.display = "none";
      } else {
        // Hide info message and show other dropdowns
        infoMessage.style.display = "none";
        studioDropdown.style.display = "block";
        titleDropdown.style.display = "block";
      }
    }
    function filterEvents() {
      const selectedBranch = branchDropdown.value;
      const selectedStudio = studioDropdown.value;
      const selectedTitle = titleDropdown.value;
  
  
      if (selectedBranch === "all") {
        // Display info message and hide other dropdowns
        infoMessage.style.display = "block";
        studioDropdown.style.display = "none";
        titleDropdown.style.display = "none";
      } else {
        // Hide info message and show other dropdowns
        infoMessage.style.display = "none";
        studioDropdown.style.display = "block";
        titleDropdown.style.display = "block";
      }
  
      const filteredEvents = data.items.filter((event) => {
        return (
          (selectedBranch === "all" || event.branch_name === selectedBranch) &&
          (selectedStudio === "all" ||event.studio_name === selectedStudio) &&
          (selectedTitle === "all" || event.title === selectedTitle)
        );
      });
  
      renderCalendar(filteredEvents, currentStartDate); // Update calendar with filtered events
    }
  
    handleInitialState();
  
    branchDropdown.addEventListener("change", filterEvents);
    studioDropdown.addEventListener("change", filterEvents);
    titleDropdown.addEventListener("change", filterEvents);
  
  // Filtered Select Option ends
  
  // Pop up for print button starts
  
  // const printDocument = document.getElementById('print_doc');
  document.querySelector("#print_doc").addEventListener('click', function() {
    document.querySelector(".custom-model-main").style.display ="block";
    document.querySelector(".bg-overlay").style.display ="block";
    document.querySelector(".custom-model-main").classList.add("model-open");
  }); 
  document.querySelector(".close-btn, .bg-overlay").addEventListener("click", function() {
    document.querySelector(".custom-model-main").classList.remove("model-open");
   
  });
   const openPdf = document.getElementById("downloadPdf");
   openPdf.addEventListener('click', ()=> {
    window.location.href = 'events.html';
   })
  
  
  const cancelButton = document.getElementById("cancelButton");
  const popUpDiv = document.getElementById("popUp");
  
  cancelButton.addEventListener("click", function () {
    popUpDiv.classList.remove("model-open");
  });
  
  // popup dropdown values starts
  
  const popUpStudios = new Set();
  const popUpTitles = new Set();
  
  
  data.items.forEach((item) => {
    if (item.studio_name) popUpStudios.add(item.studio_name);
    if (item.title) popUpTitles.add(item.title);
  });
  
  function populateDropdownPopUp(elementId, values, allOptionText) {
    const popUpDropdown = document.getElementById(elementId);
    popUpDropdown.innerHTML = "";
  
  
     // Add 'All' option
     const allOptionPopUp = document.createElement("option");
     allOptionPopUp.value = "all";
     allOptionPopUp.text = allOptionText;
     popUpDropdown.appendChild(allOptionPopUp);
  
    values.forEach((value) => {
      const popUpOption = document.createElement("option");
      popUpOption.value = value;
      popUpOption.text = value;
      popUpDropdown.appendChild(popUpOption);
    });
  }
  
  populateDropdownPopUp("popupStudio", popUpStudios, "All Studios");
  populateDropdownPopUp("popupClasses", popUpTitles, "All classes");
  
  
  const popUpStudioDropdown = document.getElementById("popupStudio");
  const popUpTitleDropdown = document.getElementById("popupClasses");
  
  
  
  
  
    function popUpFilterEvents() {
      const popUpSelectedStudio = popUpStudioDropdown.value;
      const popUpSelectedTitle = popUpTitleDropdown.value;
  
  
  
      const popUpFilteredEvents = data.items.filter((event) => {
        return (
          (popUpSelectedStudio === "all" ||event.studio_name === popUpSelectedStudio) &&
          (popUpSelectedTitle === "all" || event.title === popUpSelectedTitle)
        );
      });
  
      renderCalendar(popUpFilteredEvents, currentStartDate); // Update calendar with filtered events
    }
  
    popUpStudioDropdown.addEventListener("change", popUpFilterEvents);
    popUpTitleDropdown.addEventListener("change", popUpFilterEvents);
  
  
  
  
  
  // popup dropdown values ends
  
  // Pop up for print button ends
  
  
  // Shows Time in Hours format starts
  
    data.items.forEach((item) => {
      // Parse the start_at and end_at times
      const startTime = new Date(item.start_at);
      const endTime = new Date(item.end_at);
  
      // Calculate the difference in milliseconds
      const timeDifferenceMillis = endTime - startTime;
  
      // Convert the difference to hours
      const timeDifferenceHours = timeDifferenceMillis / (1000 * 60 * 60);
  
      // Calculate the number of full days
      const days = Math.floor(timeDifferenceHours / 24);
  
      // Calculate the remaining hours and minutes
      const remainingHours = timeDifferenceHours % 24;
      const hours = Math.floor(remainingHours);
      const minutes = Math.round((remainingHours - hours) * 60);
  
      // Format hours and minutes
      const formattedTime = `${hours < 10 ? "0" + hours : hours}.${
        minutes < 10 ? "0" + minutes : minutes
      }`;
  
      // Store the formatted time in the item object
      item.formattedTimeDifference = formattedTime;
    });
  
  
  // Shows Time in Hours format ends
  
  // Line showing conditions starts
  
    const line = document.getElementById("line_show");
    const banner = document.getElementById("banner_show");
    if (banner === "none") {
      line.style.display = "block";
    } else {
      line.style.display = "none";
    }
  
  // Line showing conditions ends
  
  // Date Picker render in the events calender starts
  
    const datePickerButton = document.getElementById("date-picker-button");
    const datePicker = document.getElementById("date-picker");

    const startDateElement = document.getElementById("start-date");
    const calendarElement = document.querySelector("#calendar tbody");
    let eventsData = [];
    const mobileView = window.innerWidth <= 480;
  
  
  // Date Picker render in the events calender ends
  
  // Date rendered by the week starts
  
    function getStartOfWeek(date) {
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);
      return startOfWeek;
    }
  
    let currentStartDate = getStartOfWeek(new Date());
    startDateElement.textContent = currentStartDate.toLocaleDateString(
      undefined,
      { month: "short", day: "numeric", year: "numeric" }
    );
  
    datePickerButton.addEventListener("click", function () {
      datePicker.style.display = "block";
      datePicker.focus();
    });
  
    datePicker.addEventListener("blur", function () {
      datePicker.style.display = "none";
    });
  
    datePicker.addEventListener("change", function () {
      const selectedDate = new Date(datePicker.value);
      currentStartDate = getStartOfWeek(selectedDate);
      startDateElement.textContent = currentStartDate.toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
      renderCalendar(filterEvents, currentStartDate);
      filterEvents();
    });


  function pageLoading(){

    let selectedDate = new Date(window.localStorage.getItem('date'));

    // currentStartDate = getStartOfWeek(selectedDate);
    if (window.innerWidth <= 768) {
    selectedDate.setDate(selectedDate.getDate());

  } else {
    selectedDate.setDate(selectedDate.getDate() + 7);
  }
    currentStartDate=selectedDate;
      startDateElement.textContent = currentStartDate.toDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
setTimeout(() => {
    renderCalendar(filterEvents, currentStartDate);
    filterEvents();    
},1000);

  }
  pageLoading();
  // Date rendered by the week ends
  
  // Conditions for prev & next arrow for displaying Week by Week Starts
  
  
    document.getElementById("next_week").addEventListener("click", () => {
      if (mobileView) {
        currentStartDate.setDate(currentStartDate.getDate() + 1);
      } else {
        currentStartDate.setDate(currentStartDate.getDate() + 7);
      }
      startDateElement.textContent = currentStartDate.toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
      renderCalendar(filterEvents, currentStartDate);
      filterEvents();
    });
  
    document.getElementById("previous_week").addEventListener("click", () => {
      if (mobileView) {
        currentStartDate.setDate(currentStartDate.getDate() - 1);
      } else {
        currentStartDate.setDate(currentStartDate.getDate() - 7);
      }
      startDateElement.textContent = currentStartDate.toLocaleDateString(
        undefined,
        { month: "short", day: "numeric", year: "numeric" }
      );
      renderCalendar(filterEvents, currentStartDate);
      filterEvents();
    });
  
  // Conditions for prev & next arrow for displaying Week by Week ends
  
  
  // Hide the loading animation 
    setTimeout(() => {
      document.querySelector(".loading").style.display = "none";
    //   renderCalendar(eventsData, new Date(currentStartDate));
    }, 2000);
  
    // Initial render with all events
    renderCalendar(filterEvents, currentStartDate);
  });
  
  